import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth, requireRole, type AuthVariables } from '../middleware/auth.js'

const products = new Hono<{ Variables: AuthVariables }>()

const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  sku: z.string().min(1),
  stock: z.number().int().min(0),
  category_id: z.uuid().optional(),
  description: z.string().optional(),
})

products.get('/', async (c) => {
  const { search, category, page } = c.req.query()
  // TODO: query DB with filters
  return c.json({ products: [], search, category, page })
})

products.get('/:id', async (c) => {
  const { id } = c.req.param()
  // TODO: fetch product by id
  return c.json({ product: { id } })
})

products.post(
  '/',
  requireAuth, requireRole('admin'),
  zValidator('json', productSchema),
  async (c) => {
    const body = c.req.valid('json')
    // TODO: insert product
    return c.json({ message: 'Product created', product: body }, 201)
  }
)

products.patch(
  '/:id',
  requireAuth, requireRole('admin', 'manager'),
  zValidator('json', productSchema.partial()),
  async (c) => {
    const { id } = c.req.param()
    const body = c.req.valid('json')
    // TODO: update product
    return c.json({ message: 'Product updated', id, ...body })
  }
)

products.delete(
  '/:id',
  requireAuth, requireRole('admin'),
  async (c) => {
    const { id } = c.req.param()
    // TODO: soft delete (set is_active = false)
    return c.json({ message: 'Product removed', id })
  }
)

export default products
