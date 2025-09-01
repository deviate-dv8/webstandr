import redisConfig from '#config/redis'
import { Queue, Worker } from 'bullmq'
import { QueueService } from '#services/queue_service'

const queueService = new QueueService()
export const SERPQueue = new Queue('SERPQueue', { connection: redisConfig.connections.main })
export const SERPWorker = new Worker(SERPQueue.name, queueService.processSERPJob, {
  connection: redisConfig.connections.main,
  concurrency: 5,
})
SERPWorker.on('completed', (job) => {
  console.log(`Job completed<SERPWorker>: ${job.id}`)
})
SERPWorker.on('failed', (job, err) => {
  console.error(`Job failed<SERPWorker>: ${job!.id}, Error: ${err.message}`)
})

export const SpeedInsightQueue = new Queue('SpeedInsightQueue', {
  connection: redisConfig.connections.main,
})
export const speedInsightWorker = new Worker(
  SpeedInsightQueue.name,
  (job) => queueService.processSpeedInsightJob(job),
  {
    connection: redisConfig.connections.main,
    concurrency: 5,
  }
)
speedInsightWorker.on('completed', (job) => {
  console.log(`Job completed<SpeedInsightWorker>: ${job.id}`)
})
speedInsightWorker.on('failed', (job, err) => {
  console.error(`Job failed<SpeedInsightWorker>: ${job!.id}, Error: ${err.message}`)
})
await setTimeout(() => {
  console.log('Scheduling SERP and Speed Insight Jobs...')
  queueService.scheduleSERPJobs(SERPQueue)
  queueService.scheduleSpeedInsightJobs(SpeedInsightQueue)
}, 10000)
