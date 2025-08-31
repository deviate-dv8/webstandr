import PromptDeleted from '#events/prompt_deleted'
import { SERPQueue } from '#start/queue'
import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'

@inject()
export default class PromptDequeue {
  constructor(private readonly logger: Logger) {}

  async handle(promptDeleted: PromptDeleted) {
    const prompt = promptDeleted.prompt
    await SERPQueue.removeJobScheduler(prompt.id)
    this.logger.info(`Removing SERP job for prompt: ${prompt.id}`)
  }
}
