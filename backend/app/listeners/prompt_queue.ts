import PromptCreated from '#events/prompt_created'
import { QueueService } from '#services/queue_service'
import { SERPQueue } from '#start/queue'
import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'

@inject()
export default class PromptQueue {
  constructor(
    private readonly logger: Logger,
    private readonly queueService: QueueService
  ) {}
  async handle(promptCreated: PromptCreated) {
    const prompt = promptCreated.prompt
    const website = promptCreated.website
    await SERPQueue.upsertJobScheduler(
      prompt.id,
      { pattern: this.queueService.scheduleToCron(prompt.schedule) },
      {
        data: { prompt, website },
      }
    )
    const { serpResponsePayload, serpResultsPayload, analysis } =
      await this.queueService.fetchSERPData(prompt, website)

    await this.queueService.saveToDB(serpResponsePayload, serpResultsPayload, analysis)
    this.logger.info(`Scheduled SERP job for prompt: ${prompt.id}`)
  }
}
