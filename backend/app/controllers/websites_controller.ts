import WebsiteCreated from '#events/website_created'
import WebsiteDeleted from '#events/website_deleted'
import Prompt from '#models/prompt'
import Website from '#models/website'
import {
  checkWebsiteValidator,
  createWebsiteValidator,
  listWebsitesValidator,
  updateWebsiteValidator,
  validateUrl,
} from '#validators/website'
import type { HttpContext } from '@adonisjs/core/http'

export default class WebsitesController {
  /**
   * Display a list of resource
   */
  async index({ auth, request }: HttpContext) {
    const payload = await request.validateUsing(listWebsitesValidator)
    if (payload.search !== undefined && !payload.searchBy) {
      return Website.query()
        .where('userId', auth.user!.id)
        .andWhere((query) => {
          query
            .where('name', 'like', `%${payload.search}%`)
            .orWhere('url', 'like', `%${payload.search}%`)
        })
        .paginate(payload.page || 1, payload.limit || 10)
    }
    if (payload.search !== undefined && payload.searchBy === 'url') {
      const urlPayload = await validateUrl.validate({ search: payload.search })
      return Website.query()
        .where('userId', auth.user!.id)
        .andWhere('url', urlPayload.search)
        .paginate(payload.page || 1, payload.limit || 10)
    }
    if (payload.search !== undefined && payload.searchBy === 'name') {
      return Website.query()
        .where('userId', auth.user!.id)
        .andWhere('name', 'like', `%${payload.search}%`)
        .paginate(payload.page || 1, payload.limit || 10)
    }
    if (payload.page !== undefined || payload.limit !== undefined) {
      return Website.query()
        .where('userId', auth.user!.id)
        .paginate(payload.page || 1, payload.limit || 10)
    }
    return Website.findManyBy('userId', auth.user!.id)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(createWebsiteValidator, {
      meta: { userId: auth.user!.id },
    })
    // check compound unique url + userId
    const existingWebsite = await Website.findBy({ url: payload.url, userId: auth.user!.id })
    if (existingWebsite) {
      return response.badRequest({
        message: 'Website with this URL already exists in your account',
      })
    }
    const newWebsite = await Website.create({ ...payload, userId: auth.user!.id })
    WebsiteCreated.dispatch(newWebsite)
    return newWebsite
  }

  /**
   * Show individual record
   */
  async show({ params, auth }: HttpContext) {
    const website = await Website.query()
      .where('id', params.id)
      .andWhere('userId', auth.user!.id)
      .preload('prompts')
      .preload('websiteInsights', (query) => query.orderBy('createdAt', 'desc').limit(1))
      .withCount('websiteInsights')
      .withCount('prompts')
      .firstOrFail()

    return {
      ...website.toJSON(),
      promptCount: Number.parseInt(website.$extras.prompts_count as string),
      websiteInsightCount: Number.parseInt(website.$extras.websiteInsights_count as string),
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    const payload = await request.validateUsing(updateWebsiteValidator, {
      meta: { userId: auth.user!.id },
    })
    const website = await Website.findByOrFail({ id: params.id, userId: auth.user!.id })
    const updatedWebsite = await website.merge(payload).save()
    WebsiteCreated.dispatch(updatedWebsite)
    return updatedWebsite
  }

  /**
   * Delete record
   */
  async destroy({ params, auth }: HttpContext) {
    const website = await Website.findByOrFail({ id: params.id, userId: auth.user!.id })
    await WebsiteDeleted.dispatch(website)
    await website.delete()
    return website
  }

  async checkWebsite({ request, response }: HttpContext) {
    try {
      const { url } = await request.validateUsing(checkWebsiteValidator)
      const formattedUrl =
        url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
      new URL(formattedUrl) // Validate the formatted URL
      const res = await fetch(formattedUrl, { method: 'HEAD' })
      if (res.ok) {
        return response.ok({ message: 'Website is available' })
      } else {
        return response.badRequest({
          message: "Website is not available in the DNS or doesn't exist",
        })
      }
    } catch (error) {
      return response.badRequest({ message: 'Invalid URL or Website is not available' })
    }
  }
}
