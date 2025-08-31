import PromptCreated from '#events/prompt_created'
import PromptDeleted from '#events/prompt_deleted'
import UserRegistered from '#events/user_registered'
import UserResetPassword from '#events/user_reset_password'
import WebsiteCreated from '#events/website_created'
import WebsiteDeleted from '#events/website_deleted'
import emitter from '@adonisjs/core/services/emitter'

const SendVerificationEmail = () => import('#listeners/send_verification_email')
const SendPasswordReset = () => import('#listeners/send_password_reset')
const PromptQueue = () => import('#listeners/prompt_queue')
const PromptDequeue = () => import('#listeners/prompt_dequeue')
const PSIDequeue = () => import('#listeners/psi_dequeue')
const PSIQueue = () => import('#listeners/psi_queue')

emitter.on(UserRegistered, [SendVerificationEmail])
emitter.on(UserResetPassword, [SendPasswordReset])
emitter.on(PromptCreated, [PromptQueue])
emitter.on(PromptDeleted, [PromptDequeue])
emitter.on(WebsiteCreated, [PSIQueue])
emitter.on(WebsiteDeleted, [PSIDequeue])
