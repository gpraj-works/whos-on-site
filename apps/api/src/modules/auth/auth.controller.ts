import { Request, Response } from 'express'
import * as authService from './auth.service'
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from './auth.schema'

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const parsed = registerSchema.parse(req.body)
    const result = await authService.register(parsed)
    res.status(201).json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to register company and owner.'
    res.status(400).json({ error: message })
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const parsed = loginSchema.parse(req.body)
    const result = await authService.login(parsed.email, parsed.password)
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid credentials.'
    res.status(401).json({ error: message })
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const parsed = refreshSchema.parse(req.body)
    const result = await authService.refreshToken(parsed.refreshToken)
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid refresh token.'
    res.status(401).json({ error: message })
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const parsed = logoutSchema.parse(req.body)
    await authService.logout(parsed.refreshToken)
    res.json({ message: 'Logged out successfully.' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to logout.'
    res.status(400).json({ error: message })
  }
}
