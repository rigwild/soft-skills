import express, { Express } from 'express'
import bodyParser from 'body-parser'
import router from './router'

export const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

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
