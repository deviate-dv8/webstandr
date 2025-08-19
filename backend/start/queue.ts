import redisConfig from '#config/redis'
import Prompt from '#models/prompt'
import { Job, Queue, Worker } from 'bullmq'
import env from './env.js'
import axios from 'axios'

export function scheduleToCron(schedule: Prompt['schedule']): string {
  switch (schedule) {
    case 'daily':
      return '0 0 * * *' // Every day at midnight
    case 'weekly':
      return '0 0 * * 0' // Every week on Sunday at midnight
    case 'monthly':
      return '0 0 1 * *' // Every month on the first day at midnight
    case 'annually':
      return '0 0 1 1 *' // Every year on January 1st at midnight
    default:
      throw new Error(`Unknown schedule type: ${schedule}`)
  }
}
async function scheduleSERPJobs(queue: Queue) {
  const prompts = await Prompt.all()
  const promptIds = prompts.map((prompt) => prompt.id)
  const allJobScheduler = await queue.getJobSchedulers()

  // Creates a job scheduler for each prompts
  for (const prompt of prompts) {
    await queue.upsertJobScheduler(
      prompt.id,
      { pattern: scheduleToCron(prompt.schedule) },
      { data: { prompt } }
    )
  }
  // Remove job schedulers for prompts that no longer exist
  for (const jobScheduler of allJobScheduler) {
    if (!promptIds.includes(jobScheduler.id as string)) {
      await queue.removeJobScheduler(jobScheduler.id as string)
    }
  }
}

async function processSERPJob(job: Job) {
  const { prompt }: { prompt: Prompt } = job.data
  const { provider, query } = prompt
  const SERPGOOGLE = env.get('SERP_GOOGLE')
  const SERPBASE = env.get('SERP_BASE')
  const API = provider === 'google' ? SERPGOOGLE : SERPBASE
  try {
    const { data } = await axios.post(`${API}/api/serp/search`, {
      provider,
      query,
    })
    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data
      if (data) {
        data
      }
      throw new Error(
        `An error occurred while fetching SERP results: ${data?.message || 'Unknown error'}`
      )
    }
  }
  console.log(`Processing SERP job for prompt: ${prompt.id}`)
}

export const SERPQueue = new Queue('SERPQueue', { connection: redisConfig.connections.main })
export const worker = new Worker(SERPQueue.name, processSERPJob, {
  connection: redisConfig.connections.main,
  concurrency: 5,
})
worker.on('completed', (job) => {
  console.log(`Job completed: ${job.id}`)
})
worker.on('failed', (job, err) => {
  console.error(`Job failed: ${job!.id}, Error: ${err.message}`)
})

scheduleSERPJobs(SERPQueue)
