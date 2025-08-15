import Website from '#models/website'
import { createWebsiteValidator, updateWebsiteValidator } from '#validators/website'
import type { HttpContext } from '@adonisjs/core/http'

export default class WebsitesController {
  /**
   * Display a list of resource
   */
  async index({ auth }: HttpContext) {
    return Website.findManyBy('userId', auth.user!.id)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth }: HttpContext) {
    const payload = await request.validateUsing(createWebsiteValidator)
    const newWebsite = await Website.create({ ...payload, userId: auth.user!.id })
    return newWebsite
  }

  /**
   * Show individual record
   */
  async show({ params, auth }: HttpContext) {
    return Website.findByOrFail({ id: params.id, userId: auth.user!.id })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    const payload = await request.validateUsing(updateWebsiteValidator)
    const website = await Website.findByOrFail({ id: params.id, userId: auth.user!.id })
    const updatedWebsite = website.merge(payload).save()
    return updatedWebsite
  }

  /**
   * Delete record
   */
  async destroy({ params, auth }: HttpContext) {
    const website = await Website.findByOrFail({ id: params.id, userId: auth.user!.id })
    await website.delete()
    return website
  }
}
