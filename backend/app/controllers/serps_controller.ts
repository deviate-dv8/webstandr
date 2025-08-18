import env from '#start/env'
import { searchValidator } from '#validators/serp'
import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'

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
}
