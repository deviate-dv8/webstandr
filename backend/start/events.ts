import PromptCreated from '#events/prompt_created'
import PromptDeleted from '#events/prompt_deleted'
import UserRegistered from '#events/user_registered'
import UserResetPassword from '#events/user_reset_password'
import emitter from '@adonisjs/core/services/emitter'

const SendVerificationEmail = () => import('#listeners/send_verification_email')
const SendPasswordReset = () => import('#listeners/send_password_reset')
const PromptQueue = () => import('#listeners/prompt_queue')
const PromptDequeue = () => import('#listeners/prompt_dequeue')

emitter.on(UserRegistered, [SendVerificationEmail])
emitter.on(UserResetPassword, [SendPasswordReset])
emitter.on(PromptCreated, [PromptQueue])
emitter.on(PromptDeleted, [PromptDequeue])
