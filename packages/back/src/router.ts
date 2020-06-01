import { Router } from 'express'
import { body } from 'express-validator'

import { asyncMiddleware, authenticatedMiddleware, injectUserDocMiddleware } from './middlewares'
import authController from './controllers/auth.controller'
import uploadController from './controllers/upload.controller'
import profileController from './controllers/profile.controller'

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
 * @apiExample {json} Example usage:
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
 *
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
  asyncMiddleware(authController.login)
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
 * @apiExample {json} Example usage:
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
 *
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
  asyncMiddleware(authController.register)
)

router.post('/upload', authenticatedMiddleware(), asyncMiddleware(uploadController.upload))

/**
 * @api {get} /profile Get user profile
 * @apiVersion 0.1.0
 * @apiName GetProfile
 * @apiGroup Profile
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *     "_id": "5ece75285e8a084208e0b0c4",
 *     "email": "apidoctest@apidoc.com",
 *     "name": "apidoctest",
 *     "joinDate": "2020-05-27T14:11:52.580Z"
 *   }
 * }
 *
 * @apiError {Error} NotAuthenticated You need to be authenticated.
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 401 Unauthorized
 * {
 *   "message": "No authorization bearer token header is set."
 * }
 */
router.get(
  '/profile',
  authenticatedMiddleware(),
  injectUserDocMiddleware(),
  asyncMiddleware(profileController.getProfile)
)

/**
 * @api {patch} /profile Edit user profile
 * @apiVersion 0.1.0
 * @apiName EditProfile
 * @apiGroup Profile
 *
 * @apiParam {String} [name] name
 *
 * @apiExample {json} Example usage:
 * {
 *   "name": "apidoctest2"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *     "_id": "5ece75285e8a084208e0b0c4",
 *     "email": "apidoctest@apidoc.com",
 *     "name": "apidoctest2",
 *     "joinDate": "2020-05-27T14:11:52.580Z"
 *   }
 * }
 *
 * @apiError {Error} NotAuthenticated You need to be authenticated.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 401 Unauthorized
 * {
 *   "message": "No authorization bearer token header is set."
 * }
 *
 * @apiError {Error} NothingToEdit None of the provided keys are editable.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "No profile data to edit."
 * }
 */
router.patch('/profile', authenticatedMiddleware(), asyncMiddleware(profileController.editProfile))

/**
 * @api {delete} /profile Delete user account
 * @apiVersion 0.1.0
 * @apiName DeleteAccount
 * @apiGroup Profile
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *     "_id": "5ece75285e8a084208e0b0c4"
 *   }
 * }
 */
router.delete('/profile', authenticatedMiddleware(), asyncMiddleware(profileController.deleteAccount))

export default router
