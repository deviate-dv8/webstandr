import env from '#start/env'
import { faviconValidator, searchValidator } from '#validators/serp'
import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'
import * as cheerio from 'cheerio'

export interface SERPResult {
  title: string
  link: string
  description: string
  rank: number
  domain: string
}
export interface SERPResponse {
  success: boolean
  provider: 'google' | 'bing' | 'yahoo' | 'duckduckgo'
  query: string
  results: SERPResult[]
  requestId: string
}
export default class SerpsController {
  async search({ request, response }: HttpContext) {
    const { provider, query } = await request.validateUsing(searchValidator)
    const SERPGOOGLE = env.get('SERP_GOOGLE')
    const SERPBASE = env.get('SERP_BASE')
    const API = provider === 'google' ? SERPGOOGLE : SERPBASE
    try {
      const { data } = await axios.post(`${API}/api/serp/search`, {
        provider,
        query,
      })
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500
        const data = error.response?.data
        if (data) {
          return response.status(status).json(data)
        }
        return response.status(status).json({
          success: false,
          message: 'An error occurred while fetching SERP results',
        })
      }
    }
  }
  async getFavicon({ request, response }: HttpContext) {
    const { url } = await request.validateUsing(faviconValidator)
    try {
      console.log('Validating URL:', url)

      // Ensure the URL has a protocol (default to https:// if missing)
      const formattedUrl =
        url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
      new URL(formattedUrl) // Validate the formatted URL

      console.log('Fetching HTML...')
      const fetchResponse = await fetch(formattedUrl) // Add timeout and follow redirects
      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch URL: ${fetchResponse.statusText}`)
      }
      const html = await fetchResponse.text()
      console.log('HTML fetched successfully')

      const $ = cheerio.load(html)

      // Look for all possible favicon-related <link> tags
      const faviconLink =
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        $('link[rel="apple-touch-icon"]').attr('href') || // Apple touch icons
        $('link[rel="apple-touch-icon-precomposed"]').attr('href') ||
        $('link[rel="mask-icon"]').attr('href') // Safari pinned tab icons

      console.log('Favicon link:', faviconLink)

      if (faviconLink) {
        // Handle relative URLs by resolving them against the base URL
        return new URL(faviconLink, formattedUrl).href
      }

      // Default to the root favicon.ico if no <link> tag is found
      console.log('Favicon not found in <link> tags, defaulting to /favicon.ico')
      return new URL('/favicon.ico', formattedUrl).href
    } catch (error) {
      console.error('Error fetching favicon:', error)
      return response.badRequest({ message: 'Failed to fetch favicon' })
    }
  }
}
