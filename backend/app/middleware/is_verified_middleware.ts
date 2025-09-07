import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class IsVerifiedMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    // console.log(ctx)
    /**
     * Call next method in the pipeline and return its output
     */
    if (!ctx.auth.user?.emailVerifiedAt) {
      return ctx.response.status(403).json({
        message:
          'Your email address is not verified. Please verify your email to access this resource.',
      })
    }
    const output = await next()
    return output
  }
}
