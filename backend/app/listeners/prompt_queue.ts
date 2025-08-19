import PromptCreated from '#events/prompt_created'
import { scheduleToCron, SERPQueue } from '#start/queue'
import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'

@inject()
export default class PromptQueue {
  constructor(private readonly logger: Logger) {}
  async handle(promptCreated: PromptCreated) {
    const prompt = promptCreated.prompt

    await SERPQueue.upsertJobScheduler(
      prompt.id,
      { pattern: scheduleToCron(prompt.schedule) },
      {
        data: { prompt },
      }
    )
    this.logger.info(`Scheduled SERP job for prompt: ${prompt.id}`)
  }
}
