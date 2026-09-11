import { Request, RequestHandler, Response } from 'express'
import * as authService from './auth.service'
import { loginSchema, registerSchema } from './auth.schema'
import { asyncHandler } from '../../middleware/error-handler'
import { sendSuccess } from '../../common/response-handler'
import { HttpStatus } from '../../common/http-status'
import { UnauthorizedError } from '../../common/app-error'
import { env } from '../../config/env'

const REFRESH_COOKIE_NAME = 'whosonsite_refresh_token'

const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProdEnv,
  sameSite: 'lax' as const,
  path: '/api/auth'
})

const getCookieOptions = () => ({
  ...getClearCookieOptions(),
  maxAge: 7 * 24 * 60 * 60 * 1000
})

export const register: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.parse(req.body)
  const result = await authService.register(parsed)

  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions())

  sendSuccess(
    res,
    {
      accessToken: result.accessToken,
      user: result.user,
      company: result.company
    },
    'Company and owner registered successfully.',
    HttpStatus.CREATED
  )
})

export const login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.parse(req.body)
  try {
    const result = await authService.login(parsed.email, parsed.password)

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions())

    sendSuccess(res, {
      accessToken: result.accessToken,
      user: result.user,
      company: result.company
    })
  } catch (err) {
    throw new UnauthorizedError(err instanceof Error ? err.message : undefined)
  }
})

export const refresh: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tokenFromCookie = req.cookies[REFRESH_COOKIE_NAME]
  const rawRefreshToken = tokenFromCookie || req.body?.refreshToken

  if (!rawRefreshToken) {
    throw new UnauthorizedError('Refresh token is required.')
  }

  try {
    const result = await authService.refreshToken(rawRefreshToken)

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions())

    sendSuccess(res, {
      accessToken: result.accessToken,
      user: result.user,
      company: result.company
    })
  } catch (err) {
    res.clearCookie(REFRESH_COOKIE_NAME, getClearCookieOptions())
    throw new UnauthorizedError(err instanceof Error ? err.message : undefined)
  }
})

export const logout: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const tokenFromCookie = req.cookies[REFRESH_COOKIE_NAME]
  const rawRefreshToken = tokenFromCookie || req.body?.refreshToken

  if (rawRefreshToken) {
    await authService.logout(rawRefreshToken)
  }

  res.clearCookie(REFRESH_COOKIE_NAME, getClearCookieOptions())
  sendSuccess(res, undefined, 'Logged out successfully.')
})

export const me: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.userId) {
    throw new UnauthorizedError('Authentication required.')
  }
  const data = await authService.getCurrentUser(req.auth.userId)
  sendSuccess(res, data)
})
