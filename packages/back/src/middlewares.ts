import boom from '@hapi/boom'
import jwt from 'jsonwebtoken'
import type { RequestHandler, ErrorRequestHandler } from 'express-serve-static-core'

import { UserController } from './database'
import { JWT_SECRET } from './config'
import type { RequestAuthed, RequestHandlerAuthed } from './types'

/**
 * Call the error handler if an async function throws an error.
 * @param fn original middleware function of the route
 * @returns The same middleware function but error handled
 */
export const asyncMiddleware = (fn: RequestHandlerAuthed) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    next(err)
  })
}

/** Middleware to handle middleware errors */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Check whether the error is a boom error
  if (!err.isBoom) {
    // Check if error is invalid JSON body
    if (err instanceof SyntaxError && err.hasOwnProperty('body')) err = boom.badRequest(err.message)
    else if (err.name === 'UnauthorizedError') err = boom.unauthorized(err)
    // The error was not recognized, send a 500 HTTP error
    else err = boom.internal(err)
  }

  const errPayload = err.output.payload
  console.error(err)

  // Send the error to the client
  res.status(errPayload.statusCode).json({
    message: err.message || errPayload.message,
    data: err.data || undefined
  })

  next()
}

/** Check a request is authenticated. Will inject the Firebase session in `req.session`.  */
export const authenticatedMiddleware = (): RequestHandler => async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization
    if (!bearerToken?.startsWith('Bearer')) throw boom.unauthorized('No authorization bearer token header is set.')

    try {
      ;(req as any).session = jwt.verify(bearerToken.split(' ')[1], JWT_SECRET)
    } catch {
      throw boom.unauthorized('Invalid authentication token.')
    }
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Inject the logged-in user user document in `req.userDoc`
 * Need to call `authenticatedMiddleware` before.
 */
export const injectUserDocMiddleware = (): RequestHandler => async (reqRaw, res, next) => {
  const req = reqRaw as RequestAuthed

  try {
    const userId = req.session?._id
    if (!userId) throw boom.unauthorized('You need to be logged in.')

    const userDoc = await UserController.find(userId)
    if (!userDoc) throw boom.notFound('The user document was not found.')

    const userData = userDoc.toObject()
    delete userData.__v
    ;(req as any).userDoc = userData
    next()
  } catch (error) {
    next(error)
  }
}
