import WebsiteDeleted from '#events/website_deleted'
import { SERPQueue } from '#start/queue'
import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'

@inject()
export default class PSIDequeue {
  constructor(private readonly logger: Logger) {}

  async handle(websiteDeleted: WebsiteDeleted) {
    const website = websiteDeleted.website
    await SERPQueue.removeJobScheduler(website.id)
    this.logger.info(`Removing PSI job for prompt: ${website.id}`)
  }
}
