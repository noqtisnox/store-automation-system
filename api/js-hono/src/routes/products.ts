import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requireAuth, requireRole, type AuthVariables } from '../middleware/auth.js'
import db from '../lib/db.js'

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
  const pageNum = Math.max(1, parseInt(page ?? '1'))
  const limit = 20
  const offset = (pageNum - 1) * limit

  const conditions: string[] = ['p.is_active = 1']
  const args: string[] = []

  if (search) {
    conditions.push('(p.name LIKE ? OR p.sku LIKE ?)')
    args.push(`%${search}%`, `%${search}%`)
  }

  if (category) {
    conditions.push('c.slug = ?')
    args.push(category)
  }

  const where = conditions.join(' AND ')

  const { rows } = await db.execute({
    sql: `SELECT
            p.id, p.name, p.description, p.sku, p.barcode,
            p.price, p.stock_quantity, p.created_at,
            c.name  AS category_name,
            c.slug  AS category_slug
          FROM products p
          LEFT JOIN categories c ON c.id = p.category_id
          WHERE ${where}
          ORDER BY p.name ASC
          LIMIT ? OFFSET ?`,
    args: [...args, limit, offset],
  })

  const { rows: countRows } = await db.execute({
    sql: `SELECT COUNT(*) as total
          FROM products p
          LEFT JOIN categories c ON c.id = p.category_id
          WHERE ${where}`,
    args,
  })

  const total = countRows[0].total as number

  return c.json({
    products: rows,
    meta: {
      page: pageNum,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
})

products.get('/:id', async (c) => {
  const { id } = c.req.param()

  const { rows } = await db.execute({
    sql: `SELECT
            p.id, p.name, p.description, p.sku, p.barcode,
            p.price, p.stock_quantity, p.created_at, p.updated_at,
            c.id   AS category_id,
            c.name AS category_name,
            c.slug AS category_slug
          FROM products p
          LEFT JOIN categories c ON c.id = p.category_id
          WHERE p.id = ? AND p.is_active = 1`,
    args: [id],
  })

  if (rows.length === 0) {
    return c.json({ message: 'Product not found' }, 404)
  }

  return c.json({ product: rows[0] })
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
