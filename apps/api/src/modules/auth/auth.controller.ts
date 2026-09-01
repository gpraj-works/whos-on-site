import { Request, RequestHandler, Response } from 'express'
import * as authService from './auth.service'
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from './auth.schema'
import { asyncHandler } from '../../middleware/error-handler'
import { sendSuccess } from '../../common/response-handler'
import { HttpStatus } from '../../common/http-status'
import { UnauthorizedError } from '../../common/app-error'

export const register: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.parse(req.body)
  const result = await authService.register(parsed)
  sendSuccess(res, result, 'Company and owner registered successfully.', HttpStatus.CREATED)
})

export const login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.parse(req.body)
  try {
    const result = await authService.login(parsed.email, parsed.password)
    sendSuccess(res, result)
  } catch (err) {
    throw new UnauthorizedError(err instanceof Error ? err.message : undefined)
  }
})

export const refresh: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = refreshSchema.parse(req.body)
  try {
    const result = await authService.refreshToken(parsed.refreshToken)
    sendSuccess(res, result)
  } catch (err) {
    throw new UnauthorizedError(err instanceof Error ? err.message : undefined)
  }
})

export const logout: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = logoutSchema.parse(req.body)
  await authService.logout(parsed.refreshToken)
  sendSuccess(res, undefined, 'Logged out successfully.')
})
