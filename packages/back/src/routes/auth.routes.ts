import { Router } from 'express'
import { body } from 'express-validator'

import { asyncMiddleware } from '../middlewares'
import { loginRequestHandler, registerRequestHandler } from '../controllers/auth.controller'

const router = Router()

/**
 * @api {post} /login Login
 * @apiVersion 0.1.0
 * @apiName Login
 * @apiGroup Authentication
 *
 * @apiParam {String} email email
 * @apiParam {String} password password
 *
 * @apiParamExample {json} Example usage:
 * {
 *   "email": "apidoctest@apidoc.com",
 *   "password": "secret"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *      "token": "jwtoken123456789",
 *      "email": "apidoctest@apidoc.com",
 *      "name": "secret"
 *   }
 * }
 *
 * @apiError {Error} InvalidCredentials Invalid email or password.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 401 Unauthorized
 * {
 *   "message": "Invalid email or password."
 * }
 */
router.post(
  '/login',
  body(['email', 'password'], 'is missing.').exists({ checkFalsy: true }),
  body('email', 'is not a valid email address.').isEmail(),
  asyncMiddleware(loginRequestHandler)
)

/**
 * @api {post} /register Register
 * @apiVersion 0.1.0
 * @apiName Register
 * @apiGroup Authentication
 *
 * @apiParam {String} email email
 * @apiParam {String} name name
 * @apiParam {String} password password
 *
 * @apiParamExample {json} Example usage:
 * {
 *   "email": "apidoctest@apidoc.com",
 *   "name": "apitest",
 *   "password": "secret"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *     "email": "apidoctest@apidoc.com",
 *     "name": "apidoctest"
 *   }
 * }
 *
 * @apiError {Error} UserExist Email already registered.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 409 Conflict
 * {
 *   "message": "Could not create the user. Email already registered."
 * }
 */
router.post(
  '/register',
  body(['email', 'name'], 'is missing.').exists({ checkFalsy: true }),
  body('email', 'is not a valid email address.').isEmail(),
  body('password', 'must be of 4 characters length minimum.').exists({ checkFalsy: true }).isLength({ min: 4 }),
  asyncMiddleware(registerRequestHandler)
)

export default router
