import WebsiteCreated from '#events/website_created'
import WebsiteInsight from '#models/website_insight'
import { QueueService } from '#services/queue_service'
import { SERPQueue } from '#start/queue'
import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'

@inject()
export default class PSIQueue {
  constructor(
    private readonly logger: Logger,
    private readonly queueService: QueueService
  ) {}
  async handle(websiteCreated: WebsiteCreated) {
    const website = websiteCreated.website
    const data = await this.queueService.getWebsiteLastInsight(website)
    if (data) {
      const payload = {
        performance: Math.round((data.lighthouseResult.categories.performance.score || 0) * 100),
        accessibility: Math.round(
          (data.lighthouseResult.categories.accessibility.score || 0) * 100
        ),
        bestPractices: Math.round(
          (data.lighthouseResult.categories['best-practices'].score || 0) * 100
        ),
        seo: Math.round((data.lighthouseResult.categories.seo.score || 0) * 100),
        websiteId: website.id,
      }
      const newWebsiteInsight = await WebsiteInsight.create(payload)
      console.log('Created new Website Insight: ', newWebsiteInsight.id)
    }
    await SERPQueue.upsertJobScheduler(
      website.id,
      { pattern: this.queueService.scheduleToCron('daily') },
      {
        data: { website },
      }
    )
    this.logger.info(`Scheduled PSI job for prompt: ${website.id}`)
  }
}
