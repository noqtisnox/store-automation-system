import { createClient } from '@libsql/client'
import path from 'path'

const DB_PATH = path.resolve(process.cwd(), '../../shared/data.db')

const db = createClient({
  url: `file:${DB_PATH}`,
})

export default db
