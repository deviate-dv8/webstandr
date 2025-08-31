import Website from '#models/website'
import { BaseEvent } from '@adonisjs/core/events'

export default class WebsiteDeleted extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public website: Website) {
    super()
  }
}
