import redisConfig from '#config/redis'
import Prompt from '#models/prompt'
import { Job, Queue, Worker } from 'bullmq'
import env from './env.js'
import axios from 'axios'

export function scheduleToMs(schedule: Prompt['schedule']): number {
  switch (schedule) {
    case 'daily':
      return 1000 * 60 * 60 * 24 // 24 hours
    case 'weekly':
      return 1000 * 60 * 60 * 24 * 7 // 7 days
    case 'monthly':
      return 1000 * 60 * 60 * 24 * 30 // 30 days
    case 'annually':
      return 1000 * 60 * 60 * 24 * 365 // 365 days
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
      { every: scheduleToMs(prompt.schedule) },
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
