import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { verifyToken } from '../lib/jwt.js'

export type AuthUser = {
  id: string
  role: 'customer' | 'manager' | 'admin'
}

export type AuthVariables = {
  user: AuthUser
}

export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const header = c.req.header('Authorization')
    if (!header?.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Missing or invalid token' })
    }
    try {
      const payload = await verifyToken(header.slice(7))
      c.set('user', { id: payload.sub, role: payload.role })
    } catch {
      throw new HTTPException(401, { message: 'Token expired or invalid' })
    }
    await next()
  }
)

export const requireRole = (...roles: AuthUser['role'][]) =>
  createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get('user')
    if (!roles.includes(user.role)) {
      throw new HTTPException(403, { message: 'Insufficient permissions' })
    }
    await next()
  })
