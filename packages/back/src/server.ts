import express from 'express'
import bodyParser from 'body-parser'

import router from './routes'
import { SERVER_PORT, UPLOADS_DIR, isTestEnv } from './config'
import { connectDb } from './db'
import { errorHandler } from './middlewares'
import { log } from './utils'

export const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Log requests
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (!isTestEnv) app.use(require('morgan')('combined'))

// Use gzip compression
// eslint-disable-next-line @typescript-eslint/no-var-requires
app.use(require('compression')())

// Open CORS FIXME: Restrict when going in production
// eslint-disable-next-line @typescript-eslint/no-var-requires
app.use(require('cors')({ origin: true }))

// Set some HTTP security headers
// eslint-disable-next-line @typescript-eslint/no-var-requires
app.use(require('helmet')())

// Accept file uploads
app.use(
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('express-fileupload')({
    abortOnLimit: true,
    limits: { fileSize: 20971520 },
    safeFileNames: true,
    preserveExtension: 4, // 4 to support `.webm`
    createParentPath: UPLOADS_DIR
  })
)

app.use(router)

// Register the error handler
app.use(errorHandler)

export const initServer = async () => {
  log('Connecting to the database...')
  await connectDb()
  log('Database connection established.')

  log('Starting the server...')
  new Promise(resolve =>
    app.listen(SERVER_PORT, () => {
      log(`Server is listening on http://localhost:${SERVER_PORT}`)
      resolve(app)
    })
  )
}
