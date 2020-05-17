import { Request } from 'express'
import boom from '@hapi/boom'
import { validationResult, ErrorFormatter } from 'express-validator'

/**
 * `express-validator` middleware error formatter
 * `Field <error-message>`
 */
export const errorFormatter: ErrorFormatter = ({ msg, param }) =>
  `${param.slice(0, 1).toUpperCase()}${param.slice(1)} ${msg}`

/**
 * Run `express-validator` middleware input validation
 * @param req Express request
 * @throws 400 Bad Request
 */
export const runRequestValidator = (req: Request) => {
  const reqErrors = validationResult(req).formatWith(errorFormatter)
  if (!reqErrors.isEmpty()) throw boom.badRequest(undefined, reqErrors.mapped())
}
