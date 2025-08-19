import Prompt from '#models/prompt'
import { BaseEvent } from '@adonisjs/core/events'

export default class PromptDeleted extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public prompt: Prompt) {
    super()
  }
}
