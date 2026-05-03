import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production'
)

const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_TTL = '7d'

export type JWTPayload = {
  sub: string               // user id
  role: 'customer' | 'manager' | 'admin'
}

export async function signAccessToken(payload: JWTPayload) {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(JWT_SECRET)
}

export async function signRefreshToken(payload: JWTPayload) {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_TTL)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return {
    sub: payload.sub as string,
    role: payload.role as JWTPayload['role'],
  }
}
