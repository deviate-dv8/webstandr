import Prompt from '#models/prompt'
import Website from '#models/website'
import { BaseEvent } from '@adonisjs/core/events'

export default class PromptCreated extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(
    public prompt: Prompt,
    public website: Website
  ) {
    super()
  }
}
