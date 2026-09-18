import { CompanyRegistrationEmailParams, PasswordResetEmailParams } from './email.types'

/** Wraps inner body content with an elegant, responsive WhosOnSite brand layout */
export function renderEmailBaseLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 40px 0;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
      padding: 32px 28px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .header p {
      margin: 6px 0 0 0;
      color: #ccfbf1;
      font-size: 14px;
    }
    .content {
      padding: 32px 28px;
    }
    .button-container {
      margin: 28px 0;
      text-align: center;
    }
    .button {
      display: inline-block;
      background-color: #0d9488;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
      box-shadow: 0 2px 4px rgba(13, 148, 136, 0.3);
    }
    .details-box {
      background-color: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .details-row {
      margin: 8px 0;
      font-size: 14px;
    }
    .details-label {
      font-weight: 600;
      color: #64748b;
      display: inline-block;
      width: 120px;
    }
    .details-value {
      color: #0f172a;
    }
    .footer {
      padding: 20px 28px;
      text-align: center;
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>WhosOnSite</h1>
        <p>Field Service & Real-Time Job Dispatch</p>
      </div>
      <div class="content">
        ${bodyHtml}
      </div>
      <div class="footer">
        <p>Sent automatically by WhosOnSite Dispatch Platform.</p>
        <p>&copy; ${new Date().getFullYear()} WhosOnSite. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

/** Generates welcome email HTML and plain text for newly registered companies */
export function buildCompanyRegistrationEmail(params: CompanyRegistrationEmailParams): {
  html: string
  text: string
  subject: string
} {
  const subject = `Welcome to WhosOnSite — ${params.companyName} Registered Successfully`
  const loginUrl = params.loginUrl || 'http://localhost:5173/login'

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Welcome aboard, ${params.companyName}!</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #334155;">
      Your company account has been registered and initialized successfully. You can now access your real-time dispatch dashboard, manage field agents, schedule jobs, and track live technician locations.
    </p>

    <div class="details-box">
      <div class="details-row">
        <span class="details-label">Company:</span>
        <span class="details-value"><strong>${params.companyName}</strong></span>
      </div>
      <div class="details-row">
        <span class="details-label">Owner Email:</span>
        <span class="details-value">${params.to}</span>
      </div>
      ${
        params.phone
          ? `<div class="details-row">
        <span class="details-label">Phone:</span>
        <span class="details-value">${params.phone}</span>
      </div>`
          : ''
      }
      ${
        params.address
          ? `<div class="details-row">
        <span class="details-label">Address:</span>
        <span class="details-value">${params.address}</span>
      </div>`
          : ''
      }
    </div>

    <div class="button-container">
      <a href="${loginUrl}" class="button" target="_blank" rel="noopener noreferrer">
        Open Dispatch Dashboard &rarr;
      </a>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 24px;">
      If you did not initiate this company registration, please contact our support team immediately.
    </p>
  `

  const text = `Welcome to WhosOnSite, ${params.companyName}!\n\n` +
    `Your company account has been registered successfully.\n\n` +
    `Account Details:\n` +
    `- Company: ${params.companyName}\n` +
    `- Owner Email: ${params.to}\n` +
    (params.phone ? `- Phone: ${params.phone}\n` : '') +
    (params.address ? `- Address: ${params.address}\n` : '') +
    `\nAccess your dashboard: ${loginUrl}\n\n` +
    `If you did not initiate this registration, please contact our support team.`

  return {
    subject,
    html: renderEmailBaseLayout(subject, bodyHtml),
    text
  }
}

/** Generates password reset email HTML and plain text */
export function buildPasswordResetEmail(params: PasswordResetEmailParams): {
  html: string
  text: string
  subject: string
} {
  const subject = 'Reset Your WhosOnSite Password'

  const bodyHtml = `
    <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">Password Reset Request</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #334155;">
      We received a request to reset the password for your account associated with <strong>${params.to}</strong>.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #475569;">
      Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.
    </p>

    <div class="button-container">
      <a href="${params.resetUrl}" class="button" target="_blank" rel="noopener noreferrer">
        Reset Password &rarr;
      </a>
    </div>

    <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 24px;">
      If you did not request a password reset, you can safely ignore this email — your account remains secure and no changes have been made.
    </p>
  `

  const text = `Reset Your WhosOnSite Password\n\n` +
    `We received a request to reset your password for ${params.to}.\n\n` +
    `Use this link to set a new password (valid for 1 hour):\n` +
    `${params.resetUrl}\n\n` +
    `If you did not request this, you can safely ignore this message.`

  return {
    subject,
    html: renderEmailBaseLayout(subject, bodyHtml),
    text
  }
}

