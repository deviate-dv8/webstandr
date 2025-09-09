import PromptCreated from '#events/prompt_created'
import PromptDeleted from '#events/prompt_deleted'
import Prompt from '#models/prompt'
import Website from '#models/website'
import { createPromptValidator, updatePromptvalidator } from '#validators/prompt'
import type { HttpContext } from '@adonisjs/core/http'

export default class PromptsController {
  /**
   * Display a list of resource
   */
  async index({ auth }: HttpContext) {
    const prompts = await Prompt.query().where('userId', auth.user!.id).preload('website')
    const totalPromptQuery = await Prompt.query()
      .where('user_id', auth.user!.id)
      .count('* as total')
      .first()
    const totalPrompts = totalPromptQuery ? Number.parseInt(totalPromptQuery.$extras.total) : 0

    const scheduleCountQuery = await Prompt.query()
      .where('userId', auth.user!.id)
      .select('schedule')
      .count('* as count')
      .groupBy('schedule')
    let schedules: { [key in Prompt['schedule']]?: number } = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      annually: 0,
    }
    scheduleCountQuery.forEach((item) => {
      const schedule = item.schedule as Prompt['schedule']
      schedules[schedule] = Number.parseInt(item.$extras.count)
    })

    const providerCounts = await Prompt.query()
      .join('websites', 'prompts.website_id', 'websites.id')
      .select('provider')
      .count('* as count')
      .groupBy('provider')
    let providers: { [key in Prompt['provider']]: number } = {
      google: 0,
      bing: 0,
      duckduckgo: 0,
      yahoo: 0,
    }

    providerCounts.forEach((item) => {
      const provider = item.provider as Prompt['provider']
      providers[provider] = Number.parseInt(item.$extras.count)
    })
    return { prompts, totalPrompts, schedules, providers }
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
    let newPrompt = await Prompt.create({ ...payload, userId: auth.user!.id })
    newPrompt = await newPrompt.refresh()
    await PromptCreated.dispatch(newPrompt, website)
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
    PromptDeleted.dispatch(prompt)
    return prompt
  }
}
