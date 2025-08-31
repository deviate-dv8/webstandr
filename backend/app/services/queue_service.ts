import Prompt from '#models/prompt'
import axios from 'axios'
import Website from '#models/website'
import SerpResponse from '#models/serp_response'
import SerpResult from '#models/serp_result'
import SerpAnalysis from '#models/serp_analysis'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'
import { Job, Queue } from 'bullmq'
import WebsiteInsight from '#models/website_insight'
interface SerpResponseType {
  id: string
  requestId: string
  success: boolean
  provider: 'google' | 'bing' | 'yahoo' | 'duckduckgo'
  query: string
  results: SerpResultType[]
  createdAt: Date
  updatedAt: Date
}
interface SerpResultType {
  title: string
  link: string
  description: string
  rank: number
  domain: string
}

interface PSIResponseType {
  lighthouseResult: {
    categories: {
      'performance': { score: number }
      'accessibility': { score: number }
      'best-practices': { score: number }
      'seo': { score: number }
      'pwa': { score: number }
    }
  }
}
export class QueueService {
  scheduleToCron(schedule: Prompt['schedule'] | 'minutely' | 'hourly' | 'every5Sec'): string {
    switch (schedule) {
      case 'every5Sec':
        return '*/5 * * * * *' // Every 5 seconds
      case 'minutely':
        return '* * * * *' // Every minute
      case 'hourly':
        return '0 * * * *' // Every hour at minute 0
      case 'daily':
        return '0 0 * * *' // Every day at midnight
      case 'weekly':
        return '0 0 * * 0' // Every week on Sunday at midnight
      case 'monthly':
        return '0 0 1 * *' // Every month on the first day at midnight
      case 'annually':
        return '0 0 1 1 *' // Every year on January 1st at midnight
      default:
        throw new Error(`Unknown schedule type: ${schedule}`)
    }
  }
  async scheduleSERPJobs(queue: Queue) {
    const prompts = await Prompt.query().whereNotNull('websiteId').preload('website')
    const promptIds = prompts.map((prompt) => prompt.id)
    const allJobScheduler = await queue.getJobSchedulers()

    // Creates a job scheduler for each prompts
    for (const prompt of prompts) {
      await queue.upsertJobScheduler(
        prompt.id,
        { pattern: this.scheduleToCron(prompt.schedule) },
        { data: { prompt, website: prompt.website } }
      )
    }
    // Remove job schedulers for prompts that no longer exist
    for (const jobScheduler of allJobScheduler) {
      if (!promptIds.includes(jobScheduler.id as string)) {
        await queue.removeJobScheduler(jobScheduler.id as string)
      }
    }
  }

  async processSERPJob(job: Job) {
    const { prompt, website }: { prompt: Prompt; website: Website } = job.data
    const { provider, query } = prompt
    const SERPGOOGLE = env.get('SERP_GOOGLE')
    const SERPBASE = env.get('SERP_BASE')
    const API = provider === 'google' ? SERPGOOGLE : SERPBASE
    try {
      const { data } = await axios.post<SerpResponseType>(`${API}/api/serp/search`, {
        provider,
        query,
      })
      const analysis: {
        averageRank: number | null
        highestRank: number | null
        frequency: number
      } = {
        averageRank: null,
        highestRank: null,
        frequency: 0,
      }
      const targetDomain = website.url
      const ranks = data.results
        .filter((result) => result.domain.includes(targetDomain))
        .map((result) => result.rank)
      if (ranks.length > 0) {
        analysis.frequency = ranks.length
        analysis.highestRank = Math.min(...ranks)
        analysis.averageRank = Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length)
      }
      const { results: serpResultsPayload, createdAt, updatedAt, ...serpResponsePayload } = data
      const parsedSerpResponsePayload = {
        ...serpResponsePayload,
        promptId: prompt.id,
      }
      const trx = await db.transaction()
      try {
        const serpResponse = await SerpResponse.create(parsedSerpResponsePayload, { client: trx })
        const serpAnalysisPayload = { ...analysis, serpResponseId: serpResponse.id }
        const parsedSerpResultsPayload: (SerpResultType & { serpResponseId: string })[] =
          serpResultsPayload.map((result) => ({
            ...result,
            serpResponseId: serpResponse.id,
          }))
        await SerpAnalysis.create(serpAnalysisPayload, { client: trx })
        await SerpResult.createMany(parsedSerpResultsPayload, { client: trx })
        await trx.commit()
      } catch (err) {
        console.log('Transaction failed, rolling back.')
        await trx.rollback()
        throw new Error('Transaction failed, rolling back.')
      }
      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data
        if (data) {
          data
        }
        throw new Error(
          `An error occurred while fetching SERP results: ${data?.message || 'Unknown error'}`
        )
      }
    }
    console.log(`Processing SERP job for prompt: ${prompt.id}`)
  }

  async scheduleSpeedInsightJobs(queue: Queue) {
    const websites = await Website.all()
    const websiteIds = websites.map((website) => website.id)
    const allJobScheduler = await queue.getJobSchedulers()

    // Creates a job scheduler for each website
    for (const website of websites) {
      await queue.upsertJobScheduler(
        website.id,
        { pattern: this.scheduleToCron('daily') },
        { data: { website } }
      )
    }
    // Remove job schedulers for websites that no longer exist
    for (const jobScheduler of allJobScheduler) {
      if (!websiteIds.includes(jobScheduler.id as string)) {
        await queue.removeJobScheduler(jobScheduler.id as string)
      }
    }
  }
  public async getWebsiteLastInsight(website: Website) {
    const url = website.url
    const formattedUrl =
      url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
    new URL(formattedUrl) // Validate the formatted URL
    try {
      const result = await axios.get<PSIResponseType>(
        'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?category=performance&category=accessibility&category=best-practices&category=seo',
        {
          method: 'GET',
          params: {
            key: env.get('PAGE_SPEED_INSIGHT_API'),
            url: formattedUrl,
          },
        }
      )
      return result.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data
        if (data) {
          data
        }
        throw new Error(
          `An error occurred while fetching Speed Insight results: ${data?.message || 'Unknown error'}`
        )
      }
    }
  }
  async processSpeedInsightJob(job: Job) {
    const { website }: { website: Website } = job.data
    const data = await this.getWebsiteLastInsight(website)
    console.log(`Processing Speed Insight job for job id: ${job.id}`)
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
      return data
    } else {
      console.log('No data received from PageSpeed Insights API')
      throw new Error('No data received from PageSpeed Insights API')
    }
  }
}
