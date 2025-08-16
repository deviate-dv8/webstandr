import Prompt from '#models/prompt'
import Website from '#models/website'
import { createPromptValidator, updatePromptvalidator } from '#validators/prompt'
import type { HttpContext } from '@adonisjs/core/http'

export default class PromptsController {
  /**
   * Display a list of resource
   */
  async index({ auth }: HttpContext) {
    return Prompt.findManyBy('userId', auth.user!.id)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(createPromptValidator)
    const website = await Website.findBy({ id: payload.websiteId, userId: auth.user!.id })
    if (!website) {
      return response.badRequest({ message: 'Website not found or you do not have access to it.' })
    }
    const newPrompt = await Prompt.create({ ...payload, userId: auth.user!.id })
    return newPrompt
  }

  /**
   * Show individual record
   */
  async show({ params, auth }: HttpContext) {
    return Prompt.findByOrFail({ id: params.id, userId: auth.user!.id })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(updatePromptvalidator)
    const prompt = await Prompt.findByOrFail({ id: params.id, userId: auth.user!.id })
    if (payload.websiteId) {
      const website = await Website.findBy({ id: payload.websiteId, userId: auth.user!.id })
      if (!website) {
        return response.badRequest({
          message: 'Website not found or you do not have access to it.',
        })
      }
    }
    const updatedPrompt = await prompt.merge(payload).save()
    return updatedPrompt
  }

  /**
   * Delete record
   */
  async destroy({ params, auth }: HttpContext) {
    const prompt = await Prompt.findByOrFail({ id: params.id, userId: auth.user!.id })
    await prompt.delete()
    return prompt
  }
}
