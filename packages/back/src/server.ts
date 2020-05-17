import express from 'express'
import bodyParser from 'body-parser'

import router from './router'
import { SERVER_PORT } from './config'
import { connectDb } from './database'
import { errorHandler } from './middlewares'

export const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Log requests
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (process.env.NODE_ENV !== 'test') app.use(require('morgan')('combined'))

// Use gzip compression
// eslint-disable-next-line @typescript-eslint/no-var-requires
app.use(require('compression')())

// Set some HTTP security headers
// eslint-disable-next-line @typescript-eslint/no-var-requires
app.use(require('helmet')())

app.use(router)

// Register the error handler
app.use(errorHandler)

export const initServer = async () => {
  console.log('Connecting to the database...')
  await connectDb()
  console.log('Database connection established.')

  console.log('Starting the server...')
  if (process.env.NODE_ENV !== 'test')
    return new Promise(resolve =>
      app.listen(SERVER_PORT, () => {
        console.log(`Server is listening on http://localhost:${SERVER_PORT}`)
        resolve(app)
      })
    )
}
