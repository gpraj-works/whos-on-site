import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { env } from '../../config/env'
import { logger } from '../logging/logger'
import {
  CompanyRegistrationEmailParams,
  PasswordResetEmailParams,
  SendEmailOptions,
  SendEmailResult
} from './email.types'
import { buildCompanyRegistrationEmail, buildPasswordResetEmail } from './email.templates'

let transporterInstance: Transporter | null = null

/** Returns an active nodemailer transporter or null if SMTP is not configured */
function getTransporter(): Transporter | null {
  if (transporterInstance) {
    return transporterInstance
  }

  if (env.SMTP_HOST && env.SMTP_USER) {
    try {
      transporterInstance = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_SECURE || false,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS
        }
      })
      logger.info({ host: env.SMTP_HOST, port: env.SMTP_PORT }, '[EmailService] Initialized SMTP transport')
      return transporterInstance
    } catch (err) {
      logger.error({ err }, '[EmailService] Failed to initialize SMTP transporter')
      return null
    }
  }

  return null
}

/**
 * Reusable email sending function.
 * Dispatches via SMTP when configured, or safely logs to logger in dev/test/offline environments.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const fromAddress = options.from || env.SMTP_FROM || 'WhosOnSite <notifications@whosonsite.internal>'
  const transporter = getTransporter()

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
        cc: Array.isArray(options.cc) ? options.cc.join(', ') : options.cc,
        bcc: Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc
      })

      logger.info(
        { messageId: info.messageId, to: options.to, subject: options.subject },
        '[EmailService] Email dispatched successfully'
      )

      return {
        success: true,
        messageId: info.messageId
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown mail error'
      logger.error({ err: errorMessage, to: options.to, subject: options.subject }, '[EmailService] Failed to send email')
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // Fallback mode for development/test/offline
  const simulatedId = `simulated-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  logger.info(
    {
      to: options.to,
      subject: options.subject,
      simulatedId
    },
    '[EmailService] Email sent (simulated mode — configure SMTP_HOST to send real emails)'
  )

  return {
    success: true,
    messageId: simulatedId
  }
}

/**
 * Sends a welcome / registration success email to a newly registered company
 */
export async function sendCompanyRegistrationEmail(
  params: CompanyRegistrationEmailParams
): Promise<SendEmailResult> {
  const loginUrl = params.loginUrl || `${env.APP_URL || 'http://localhost:5173'}/login`
  const { subject, html, text } = buildCompanyRegistrationEmail({
    ...params,
    loginUrl
  })

  return sendEmail({
    to: params.to,
    subject,
    html,
    text
  })
}

/**
 * Sends a password reset email
 */
export async function sendPasswordResetEmail(
  params: PasswordResetEmailParams
): Promise<SendEmailResult> {
  const { subject, html, text } = buildPasswordResetEmail(params)

  return sendEmail({
    to: params.to,
    subject,
    html,
    text
  })
}

