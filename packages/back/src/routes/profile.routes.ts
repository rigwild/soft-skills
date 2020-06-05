import { Router } from 'express'

import { asyncMiddleware, authenticatedMiddleware, injectUserDocMiddleware } from '../middlewares'
import {
  getProfileRequestHandler,
  editProfileRequestHandler,
  deleteAccountRequestHandler
} from '../controllers/profile.controller'

const router = Router()

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
 */
router.get('/profile', authenticatedMiddleware(), injectUserDocMiddleware(), asyncMiddleware(getProfileRequestHandler))

/**
 * @api {patch} /profile Edit user profile
 * @apiVersion 0.1.0
 * @apiName EditProfile
 * @apiGroup Profile
 *
 * @apiParam {String} [name] name
 *
 * @apiParamExample {json} Example usage:
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
 * @apiError {Error} NothingToEdit None of the provided keys are editable.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "No profile data to edit."
 * }
 */
router.patch('/profile', authenticatedMiddleware(), asyncMiddleware(editProfileRequestHandler))

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
router.delete('/profile', authenticatedMiddleware(), asyncMiddleware(deleteAccountRequestHandler))

export default router
