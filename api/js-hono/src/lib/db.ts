import { createClient } from '@libsql/client'
import path from 'path'

const DB_PATH = path.resolve(process.cwd(), '../../data/store.db')

const db = createClient({
  url: `file:${DB_PATH}`,
})

export default db
