import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { Variables } from "hono/types";

export type AuthUser = {
  id: string,
  role: 'customer' | 'manager' | 'admin',
}

export type AuthVariables = {
  user: AuthUser,
}

export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header) {
    throw new HTTPException(401, { message: 'Missing or invalid token' });
  }
  // TODO: verify JWT and decode real payload
  c.set('user', { id: 'stub-user-id', role: 'admin' });
  await next();
});

export const requireRole = (...roles: AuthUser['role'][]) => createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const user = c.get('user');
  if (!roles.includes(user.role)) {
    throw new HTTPException(403, { message: 'Insufficient permissions' });
  }
  await next();
});
