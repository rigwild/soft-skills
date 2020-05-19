import { Router } from 'express'
import { body } from 'express-validator'

import { asyncMiddleware, authenticatedMiddleware, injectUserDocMiddleware } from './middlewares'
import pingController from './controllers/ping.controller'
import authController from './controllers/auth.controller'

const router = Router()

router.get('/', asyncMiddleware(pingController.ping))

/**
 * @api {post} /login  Login
 * @apiVersion 0.1.0
 * @apiName Login
 * @apiGroup Authentification
 *
 * @apiParam {String} username username
 * @apiParam {String} password password
 * 
 * @apiExample {json} Example usage:
 * {
 *  "username": "apidoctest",
 *  "password": "secret"
 * }
 * 
 * @apiSuccessExample Success-Response:
 *   HTTP/1.1 200 OK
 *    {
 *      "data": {
 *          "token": "jwtoken123456789",
 *          "username": "apidoc",
 *           "name": "secret"
 *      }
 *    }
 * 
 * @apiError InvalidCredentials Invalid email or password.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Not Found
 *     {
 *       "message": "Invalid email or password."
 *     }
 */
router.post(
  '/login',
  body(['username', 'password'], 'is missing.').exists({ checkFalsy: true }),
  asyncMiddleware(authController.login)
)


/**
 * @api {post} /register  Register
 * @apiVersion 0.1.0
 * @apiName Register
 * @apiGroup Authentification
 *
 * @apiParam {String} username username
 * @apiParam {String} name name
 * @apiParam {String} password password
 * 
 * @apiExample {json} Example usage:
 * {
 *  "username": "apidoctest",
 *  "name": "apitest"
 *  "password": "secret"
 * }
 *  
 * @apiSuccessExample Success-Response:
 *   HTTP/1.1 200 OK
 *    {
 *       "data": {
 *           "username": "apidoctest",
 *           "name": "apidoctest"
 *        }
 *    }
 * 
 * @apiError UserExist User already exists.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Not Found
 *     {
 *       "message": "Could not create the user. User already exists."
 *     }
 */
router.post(
  '/register',
  body(['username', 'name'], 'is missing.').exists({ checkFalsy: true }),
  body('password', 'must be of 4 characters length minimum.').exists({ checkFalsy: true }).isLength({ min: 4 }),
  asyncMiddleware(authController.register)
)

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
