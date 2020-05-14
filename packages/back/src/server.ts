import express, { Express } from 'express'
import bodyParser from 'body-parser'
import router from './router'

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

export const initServer = async (): Promise<Express> => {
  // await initDb()
  const port = process.env.SERVER_PORT || 3000
  return new Promise(resolve =>
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`)
      resolve(app)
    })
  )
}
