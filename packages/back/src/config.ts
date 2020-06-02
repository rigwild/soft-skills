import path from 'path'
import dotenvSafe from 'dotenv-safe'

// Load environment configuration
dotenvSafe.config({
  path:
    process.env.NODE_ENV === 'test'
      ? path.resolve(__dirname, '..', 'test', '.env.test')
      : path.resolve(__dirname, '..', '.env'),
  example: path.resolve(__dirname, '..', '.env.example')
})

const env = process.env as { [key: string]: string }

export const { MONGO_URI, JWT_SECRET } = env
export const SERVER_PORT = parseInt(env.SERVER_PORT, 10)
export const UPLOADS_DIR =
  process.env.NODE_ENV === 'test'
    ? path.resolve(__dirname, '..', 'test', 'uploads')
    : path.resolve(__dirname, '..', 'uploads')
