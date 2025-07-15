import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class HttpLoggerMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const start = Date.now()

    await next()

    const duration = Date.now() - start
    const method = ctx.request.method()
    const url = ctx.request.url()
    const query = JSON.stringify(ctx.request.qs())
    const status = ctx.response.response.statusCode

    // Log using Adonis logger
    ctx.logger.info(`${method} ${url} ${query} ${status} - ${duration}ms`)
  }
}
