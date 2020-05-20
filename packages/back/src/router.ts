import { Router } from 'express'
import { body } from 'express-validator'

import { asyncMiddleware, authenticatedMiddleware, injectUserDocMiddleware } from './middlewares'
import pingController from './controllers/ping.controller'
import authController from './controllers/auth.controller'
import uploadController from './controllers/upload.controller'

const router = Router()

router.get('/', asyncMiddleware(pingController.ping))

/**
 * @api {post} /login Login
 * @apiVersion 0.1.0
 * @apiName Login
 * @apiGroup Authentification
 *
 * @apiParam {String} email email
 * @apiParam {String} password password
 *
 * @apiExample {json} Example usage:
 * {
 *   "email": "apidoctest@example.com",
 *   "password": "secret"
 * }
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *      "token": "jwtoken123456789",
 *      "email": "apidoctest@example.com",
 *      "name": "secret"
 *   }
 * }
 *
 * @apiError InvalidCredentials Invalid email or password.
 *
 * @apiErrorExample Error-Response:
 * HTTP/1.1 401 Not Found
 * {
 *   "message": "Invalid email or password."
 * }
 */
router.post(
  '/login',
  body(['email', 'password'], 'is missing.').exists({ checkFalsy: true }),
  body('email', 'is not a valid email address.').isEmail(),
  asyncMiddleware(authController.login)
)

/**
 * @api {post} /register Register
 * @apiVersion 0.1.0
 * @apiName Register
 * @apiGroup Authentification
 *
 * @apiParam {String} email email
 * @apiParam {String} name name
 * @apiParam {String} password password
 *
 * @apiExample {json} Example usage:
 * {
 *   "email": "apidoctest@example.com",
 *   "name": "apitest"
 *   "password": "secret"
 * }
 *
 * @apiSuccessExample Success-Response:
 *   HTTP/1.1 200 OK
 * {
 *   "data": {
 *     "email": "apidoctest@example.com",
 *     "name": "apidoctest"
 *   }
 * }
 *
 * @apiError UserExist Email already registered.
 *
 * @apiErrorExample Error-Response:
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
  asyncMiddleware(authController.register)
)

router.post('/upload', authenticatedMiddleware(), asyncMiddleware(uploadController.upload))

// Just some examples
router.get(
  '/authed',
  authenticatedMiddleware(),
  asyncMiddleware((req, res) => res.json({ session: req.session }))
)
router.get(
  '/authed/user',
  authenticatedMiddleware(),
  injectUserDocMiddleware(),
  asyncMiddleware((req, res) => res.json({ session: req.session, userDoc: req.userDoc }))
)

export default router
