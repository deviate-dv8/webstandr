/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { throttle, throttlePasswordReset } from './limiter.js'

const HealthChecksController = () => import('#controllers/health_checks_controller')
const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const EmailsController = () => import('#controllers/emails_controller')
const WebsitesController = () => import('#controllers/websites_controller')
const PromptsController = () => import('#controllers/prompts_controller')
const SerpsController = () => import('#controllers/serps_controller')

router.get('/', async () => {
  return {
    message: 'webstandr API v1.0.0 by DV8',
  }
})
router.get('health', [HealthChecksController])
router
  .group(() => {
    // /api/auth
    router
      .group(() => {
        router.post('login', [AuthController, 'login'])
        router.post('signup', [AuthController, 'signup'])
        router
          .group(() => {
            router.post('logout', [AuthController, 'logout'])
            router.get('me', [AuthController, 'me'])
          })
          .use(
            middleware.auth({
              guards: ['api'],
            })
          )
      })
      .prefix('auth')
    // /api/email
    router
      .group(() => {
        router.get('verify-email/:userId/:hash', [EmailsController, 'verifyEmail'])
        router.post('send-email-verification', [EmailsController, 'sendEmailVerification']).use(
          middleware.auth({
            guards: ['api'],
          })
        )
        router
          .post('send-password-reset', [EmailsController, 'sendPasswordReset'])
          .use(throttlePasswordReset)
        router.get('reset-password/:userId/:hash', [EmailsController, 'verifyResetPassword'])
        router.post('reset-password/:userId/:hash', [EmailsController, 'resetPassword'])
      })
      .prefix('email')
    // /api/users
    router
      .resource('users', UsersController)
      .apiOnly()
      .use(['index', 'store', 'update', 'destroy'], middleware.allow_development())
    router.group(() => {
      router.post('websites/verify', [WebsitesController, 'checkWebsite'])
      router
        .resource('websites', WebsitesController)
        .apiOnly()
        .use('*', middleware.auth({ guards: ['api'] }))
    })
    router
      .resource('prompts', PromptsController)
      .apiOnly()
      .use('*', middleware.auth({ guards: ['api'] }))
    router
      .group(() => {
        router.post('search', [SerpsController, 'search']).use(throttle)
        router.post('favicon', [SerpsController, 'getFavicon'])
      })
      .use(throttle)
      .prefix('serp')
  })
  .prefix('api')
