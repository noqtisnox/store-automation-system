import { hash } from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import db from './db'
import { migrate } from './migrate'

async function seed() {
  migrate()

  console.log('Seeding database...')

  // ─── Users ────────────────────────────────────────────────────────────────

  const adminId = uuidv4()
  const managerId = uuidv4()
  const customerId = uuidv4()
  const clerkId = uuidv4()

  const passwordHash = await hash('password123', 10)

  await db.batch([
    {
      sql: `INSERT OR IGNORE INTO users (id, name, email, password_hash, role)
            VALUES (?, ?, ?, ?, ?)`,
      args: [adminId, 'Admin User', 'admin@store.com', passwordHash, 'admin'],
    },
    {
      sql: `INSERT OR IGNORE INTO users (id, name, email, password_hash, role)
            VALUES (?, ?, ?, ?, ?)`,
      args: [managerId, 'Manager User', 'manager@store.com', passwordHash, 'manager'],
    },
    {
      sql: `INSERT OR IGNORE INTO users (id, name, email, password_hash, role)
            VALUES (?, ?, ?, ?, ?)`,
      args: [customerId, 'Nox', 'nox@store.com', passwordHash, 'customer'],
    },
    {
      sql: `INSERT OR IGNORE INTO users (id, name, email, password_hash, role)
            VALUES (?, ?, ?, ?, ?)`,
      args: [clerkId, 'Clerk User', 'clerk@store.com', passwordHash, 'manager'],
    },
  ])

  // ─── Categories ───────────────────────────────────────────────────────────

  const catDairy = uuidv4()
  const catBeverages = uuidv4()
  const catSnacks = uuidv4()
  const catCleaning = uuidv4()

  await db.batch([
    {
      sql: `INSERT OR IGNORE INTO categories (id, name, slug) VALUES (?, ?, ?)`,
      args: [catDairy, 'Dairy', 'dairy'],
    },
    {
      sql: `INSERT OR IGNORE INTO categories (id, name, slug) VALUES (?, ?, ?)`,
      args: [catBeverages, 'Beverages', 'beverages'],
    },
    {
      sql: `INSERT OR IGNORE INTO categories (id, name, slug) VALUES (?, ?, ?)`,
      args: [catSnacks, 'Snacks', 'snacks'],
    },
    {
      sql: `INSERT OR IGNORE INTO categories (id, name, slug) VALUES (?, ?, ?)`,
      args: [catCleaning, 'Cleaning', 'cleaning'],
    },
  ])

  // ─── Products ─────────────────────────────────────────────────────────────

  const prodMilk = uuidv4()
  const prodCheese = uuidv4()
  const prodCoke = uuidv4()
  const prodWater = uuidv4()
  const prodChips = uuidv4()
  const prodSoap = uuidv4()

  await db.batch([
    {
      sql: `INSERT OR IGNORE INTO products
              (id, category_id, name, description, sku, barcode, price, cost_price, stock_quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [prodMilk, catDairy, 'Whole Milk 1L', 'Fresh whole milk', 'DAIRY-001', '5901234123457', 1.49, 0.80, 120],
    },
    {
      sql: `INSERT OR IGNORE INTO products
              (id, category_id, name, description, sku, barcode, price, cost_price, stock_quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [prodCheese, catDairy, 'Cheddar Cheese 200g', 'Mature cheddar block', 'DAIRY-002', '5901234123458', 2.99, 1.60, 8],
    },
    {
      sql: `INSERT OR IGNORE INTO products
              (id, category_id, name, description, sku, barcode, price, cost_price, stock_quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [prodCoke, catBeverages, 'Coca-Cola 330ml', 'Classic Coke can', 'BEV-001', '5449000000996', 0.99, 0.45, 200],
    },
    {
      sql: `INSERT OR IGNORE INTO products
              (id, category_id, name, description, sku, barcode, price, cost_price, stock_quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [prodWater, catBeverages, 'Still Water 500ml', 'Mineral water bottle', 'BEV-002', '5900497025205', 0.49, 0.15, 300],
    },
    {
      sql: `INSERT OR IGNORE INTO products
              (id, category_id, name, description, sku, barcode, price, cost_price, stock_quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [prodChips, catSnacks, 'Potato Chips 150g', 'Salted crisps', 'SNACK-001', '5060166390543', 1.29, 0.60, 5],
    },
    {
      sql: `INSERT OR IGNORE INTO products
              (id, category_id, name, description, sku, barcode, price, cost_price, stock_quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [prodSoap, catCleaning, 'Hand Soap 250ml', 'Antibacterial liquid soap', 'CLEAN-001', '8710447253052', 1.99, 0.90, 50],
    },
  ])

  // ─── Cart ─────────────────────────────────────────────────────────────────

  const cartId = uuidv4()

  await db.execute({
    sql: `INSERT OR IGNORE INTO carts (id, user_id) VALUES (?, ?)`,
    args: [cartId, customerId],
  })

  await db.batch([
    {
      sql: `INSERT OR IGNORE INTO cart_items (id, cart_id, product_id, quantity)
            VALUES (?, ?, ?, ?)`,
      args: [uuidv4(), cartId, prodMilk, 2],
    },
    {
      sql: `INSERT OR IGNORE INTO cart_items (id, cart_id, product_id, quantity)
            VALUES (?, ?, ?, ?)`,
      args: [uuidv4(), cartId, prodCoke, 4],
    },
  ])

  // ─── Orders ───────────────────────────────────────────────────────────────

  const orderId = uuidv4()

  await db.execute({
    sql: `INSERT OR IGNORE INTO orders (id, user_id, status, total_amount, tracking_number)
          VALUES (?, ?, ?, ?, ?)`,
    args: [orderId, customerId, 'shipped', 5.45, 'TRK-000123'],
  })

  await db.batch([
    {
      sql: `INSERT OR IGNORE INTO order_items
              (id, order_id, product_id, product_name, unit_price, quantity)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [uuidv4(), orderId, prodMilk, 'Whole Milk 1L', 1.49, 3],
    },
    {
      sql: `INSERT OR IGNORE INTO order_items
              (id, order_id, product_id, product_name, unit_price, quantity)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [uuidv4(), orderId, prodWater, 'Still Water 500ml', 0.49, 2],
    },
  ])

  // ─── Automation Alerts ────────────────────────────────────────────────────

  // Cheese (stock: 8) and Chips (stock: 5) are already near threshold — good for testing
  await db.batch([
    {
      sql: `INSERT OR IGNORE INTO automation_alerts
              (id, product_id, created_by, threshold, action)
            VALUES (?, ?, ?, ?, ?)`,
      args: [uuidv4(), prodCheese, adminId, 10, 'email'],
    },
    {
      sql: `INSERT OR IGNORE INTO automation_alerts
              (id, product_id, created_by, threshold, action)
            VALUES (?, ?, ?, ?, ?)`,
      args: [uuidv4(), prodChips, adminId, 10, 'reorder'],
    },
  ])

  // ─── PoS Session + Transaction ────────────────────────────────────────────

  const sessionId = uuidv4()
  const transactionId = uuidv4()

  await db.execute({
    sql: `INSERT OR IGNORE INTO pos_sessions
            (id, clerk_id, register_id, status, opening_cash)
          VALUES (?, ?, ?, ?, ?)`,
    args: [sessionId, clerkId, 'REGISTER-01', 'open', 200.00],
  })

  await db.execute({
    sql: `INSERT OR IGNORE INTO pos_transactions
            (id, session_id, clerk_id, customer_id, total_amount, payment_method, amount_tendered, change_given)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [transactionId, sessionId, clerkId, customerId, 2.47, 'cash', 5.00, 2.53],
  })

  await db.batch([
    {
      sql: `INSERT OR IGNORE INTO pos_transaction_items
              (id, transaction_id, product_id, product_name, unit_price, quantity)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [uuidv4(), transactionId, prodCoke, 'Coca-Cola 330ml', 0.99, 1],
    },
    {
      sql: `INSERT OR IGNORE INTO pos_transaction_items
              (id, transaction_id, product_id, product_name, unit_price, quantity)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [uuidv4(), transactionId, prodWater, 'Still Water 500ml', 0.49, 3],
    },
  ])
  console.log('  ✔ PoS Session + Transaction')

  // ─── Audit Log ────────────────────────────────────────────────────────────

  await db.execute({
    sql: `INSERT INTO audit_logs (id, actor_id, service, action, target_type, target_id, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      uuidv4(), adminId, 'js-hono', 'product.created',
      'Product', prodMilk,
      JSON.stringify({ note: 'Initial seed' }),
    ],
  })

  console.log('\nSeed complete! Test credentials:')
  console.log('admin@store.com    / password123  (admin)')
  console.log('manager@store.com  / password123  (manager)')
  console.log('nox@store.com      / password123  (customer)')
  console.log('clerk@store.com    / password123  (manager)')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
