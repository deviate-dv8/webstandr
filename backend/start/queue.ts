import redisConfig from '#config/redis'
import { Queue, Worker } from 'bullmq'
import { QueueService } from '#services/queue_service'

const queueService = new QueueService()
export const SERPQueue = new Queue('SERPQueue', { connection: redisConfig.connections.main })
export const SpeedInsightQueue = new Queue('SpeedInsightQueue', {
  connection: redisConfig.connections.main,
})
setTimeout(async () => {
  console.log('Scheduling SERP and Speed Insight Jobs...')
  await queueService.scheduleSERPJobs(SERPQueue)
  await queueService.scheduleSpeedInsightJobs(SpeedInsightQueue)
  console.log('Starting Workers')
  const SERPWorker = new Worker(SERPQueue.name, (job) => queueService.processSERPJob(job), {
    connection: redisConfig.connections.main,
    concurrency: 5,
    removeOnComplete: {
      age: 3600,
      count: 10,
    },
  })
  SERPWorker.on('completed', (job) => {
    console.log(`Job completed<SERPWorker>: ${job.id}`)
  })
  SERPWorker.on('failed', (job, err) => {
    console.error(`Job failed<SERPWorker>: ${job!.id}, Error: ${err.message}`)
  })

  const speedInsightWorker = new Worker(
    SpeedInsightQueue.name,
    (job) => queueService.processSpeedInsightJob(job),
    {
      connection: redisConfig.connections.main,
      concurrency: 5,
      drainDelay: 500,
      removeOnComplete: {
        age: 3600,
        count: 10,
      },
    }
  )
  speedInsightWorker.on('completed', (job) => {
    console.log(`Job completed<SpeedInsightWorker>: ${job.id}`)
  })
  speedInsightWorker.on('failed', (job, err) => {
    console.error(`Job failed<SpeedInsightWorker>: ${job!.id}, Error: ${err.message}`)
  })
}, 10000)
