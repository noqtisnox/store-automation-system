import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { hash, compare } from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { requireAuth, type AuthVariables } from '../middleware/auth.js'
import { signAccessToken, signRefreshToken, verifyToken } from '../lib/jwt.js'
import db from '../lib/db.js'

const auth = new Hono<{ Variables: AuthVariables }>()

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
  const { name, email, password } = c.req.valid('json')

  const existing = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [email],
  })
  if (existing.rows.length > 0) {
    return c.json({ message: 'Email already in use' }, 409)
  }

  const id = uuidv4()
  const password_hash = await hash(password, 10)

  await db.execute({
    sql: `INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)`,
    args: [id, name, email, password_hash],
  })

  const accessToken = await signAccessToken({ sub: id, role: 'customer' })
  const refreshToken = await signRefreshToken({ sub: id, role: 'customer' })

  await db.execute({
    sql: `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
          VALUES (?, ?, ?, datetime('now', '+7 days'))`,
    args: [uuidv4(), id, await hash(refreshToken, 10)],
  })

  return c.json({ token: accessToken, refreshToken, user: { id, name, email, role: 'customer' } }, 201)
})

auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ? AND is_active = 1',
    args: [email],
  })

  const user = result.rows[0]

  const dummyHash = '$2a$10$dummy.hash.to.prevent.timing.attacks.padding'
  const passwordMatch = await compare(password, (user?.password_hash as string) ?? dummyHash)

  if (!user || !passwordMatch) {
    return c.json({ message: 'Invalid email or password' }, 401)
  }

  const role = user.role as 'customer' | 'manager' | 'admin'
  const accessToken = await signAccessToken({ sub: user.id as string, role })
  const refreshToken = await signRefreshToken({ sub: user.id as string, role })

  await db.execute({
    sql: `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
          VALUES (?, ?, ?, datetime('now', '+7 days'))`,
    args: [uuidv4(), user.id, await hash(refreshToken, 10)],
  })

  return c.json({
    token: accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role },
  })
})

auth.post('/logout', requireAuth, async (c) => {
  const user = c.get('user')

  await db.execute({
    sql: `UPDATE refresh_tokens SET revoked_at = datetime('now')
          WHERE user_id = ? AND revoked_at IS NULL`,
    args: [user.id],
  })

  return c.json({ message: 'Logged out' })
})

auth.post('/refresh', async (c) => {
  const body = await c.req.json().catch(() => null)
  const refreshToken = body?.refreshToken

  if (!refreshToken) {
    return c.json({ message: 'Refresh token required' }, 400)
  }

  try {
    const payload = await verifyToken(refreshToken)

    const result = await db.execute({
      sql: `SELECT * FROM refresh_tokens
            WHERE user_id = ? AND revoked_at IS NULL AND expires_at > datetime('now')`,
      args: [payload.sub],
    })

    if (result.rows.length === 0) {
      return c.json({ message: 'Refresh token invalid or expired' }, 401)
    }

    const newAccessToken = await signAccessToken({ sub: payload.sub, role: payload.role })
    return c.json({ token: newAccessToken })
  } catch {
    return c.json({ message: 'Invalid refresh token' }, 401)
  }
})

auth.post('/password-reset', async (c) => {
  const body = await c.req.json().catch(() => null)
  const email = body?.email

  if (!email) return c.json({ message: 'Email required' }, 400)

  const result = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ? AND is_active = 1',
    args: [email],
  })

  if (result.rows.length === 0) {
    return c.json({ message: 'If that email exists, a reset link has been sent' })
  }

  const user = result.rows[0]
  const resetToken = uuidv4()

  await db.execute({
    sql: `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
          VALUES (?, ?, ?, datetime('now', '+15 minutes'))`,
    args: [uuidv4(), user.id, await hash(resetToken, 10)],
  })

  // TODO: send email with resetToken
  console.log(`[DEV] Password reset token for ${email}: ${resetToken}`)

  return c.json({ message: 'If that email exists, a reset link has been sent' })
})

auth.post('/password-reset/confirm', async (c) => {
  const body = await c.req.json().catch(() => null)
  const { token, new_password } = body ?? {}

  if (!token || !new_password) {
    return c.json({ message: 'Token and new_password required' }, 400)
  }

  const result = await db.execute({
    sql: `SELECT * FROM password_reset_tokens
          WHERE used_at IS NULL AND expires_at > datetime('now')`,
    args: [],
  })

  let matched = null
  for (const row of result.rows) {
    if (await compare(token, row.token_hash as string)) {
      matched = row
      break
    }
  }

  if (!matched) {
    return c.json({ message: 'Invalid or expired reset token' }, 401)
  }

  const newHash = await hash(new_password, 10)

  await db.execute({
    sql: 'UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?',
    args: [newHash, matched.user_id],
  })

  await db.execute({
    sql: `UPDATE password_reset_tokens SET used_at = datetime('now') WHERE id = ?`,
    args: [matched.id],
  })

  return c.json({ message: 'Password updated' })
})

export default auth
