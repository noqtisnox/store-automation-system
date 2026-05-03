import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'

const auth = new Hono()

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
})

auth.post('/signup', zValidator('json', signupSchema), async (c) => {
  const body = c.req.valid('json')
  // TODO: hash password, insert user, return token
  return c.json({ message: 'User created', email: body.email }, 201)
})

auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json')
  // TODO: verify credentials, sign JWT
  return c.json({ token: 'stub-token', user: { email: body.email } })
})

auth.post('/logout', requireAuth, async (c) => {
  // TODO: revoke refresh token
  return c.json({ message: 'Logged out' })
})

auth.post('/refresh', async (c) => {
  // TODO: verify refresh token, issue new access token
  return c.json({ token: 'new-stub-token' })
})

auth.post('/password-reset', async (c) => {
  // TODO: generate reset token, send email
  return c.json({ message: 'Reset email sent' })
})

auth.post('/password-reset/confirm', async (c) => {
  // TODO: verify token, update password
  return c.json({ message: 'Password updated' })
})

export default auth
