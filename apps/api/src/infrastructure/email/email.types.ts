export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  previewUrl?: string
  error?: string
}

export interface CompanyRegistrationEmailParams {
  to: string
  companyName: string
  phone?: string | null
  address?: string | null
  loginUrl?: string
}

export interface PasswordResetEmailParams {
  to: string
  resetUrl: string
}
