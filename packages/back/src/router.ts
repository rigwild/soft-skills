import { Router } from 'express'
import { body } from 'express-validator'

import { asyncMiddleware, authenticatedMiddleware, injectUserDocMiddleware } from './middlewares'
import authController from './controllers/auth.controller'
import analyzisController from './controllers/analyzis.controller'
import profileController from './controllers/profile.controller'
import type { AudioAnalyzisData } from './types'

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
  asyncMiddleware(authController.register)
)

/**
 * @api {post} /uploads Upload a file for analyzis
 * @apiVersion 0.1.0
 * @apiName UploadFile
 * @apiGroup Uploads
 *
 * @apiParam {Blob} content File to upload (audio or video)
 *
 * @apiParamExample {Blob} Example usage:
 * FormData(content: Blob)
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *     "name": "yh_662tF__NW001.mp3",
 *     "mimeType": "audio/mpeg",
 *     "size": 339216
 *   }
 * }
 *
 * @apiError {Error} FileMissing You need to send a file.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "You need to send a file."
 * }
 *
 * @apiError {Error} BadMimeType You need to send an audio or video file.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "You need to send an audio or video file."
 * }
 */
router.post('/uploads', authenticatedMiddleware(), asyncMiddleware(analyzisController.upload))

/**
 * @api {get} /uploads Get the list of all files sent for analyzis
 * @apiVersion 0.1.0
 * @apiName UploadedFiles
 * @apiGroup Uploads
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": [
 *     {
 *       "state": "pending",
 *       "_id": "5ed66cc0dbaee47acd2c1063",
 *       "name": "ah_662tF__NW001.mp3",
 *       "size": 339216,
 *       "mimeType": "audio/mpeg"
 *     },
 *     {
 *       "state": "error",
 *       "_id": "5ed66cc0dbaee47acd2c1064",
 *       "name": "bh_662tF__NW001.mp3",
 *       "size": 339216,
 *       "mimeType": "audio/mpeg"
 *     },
 *     {
 *       "state": "finished",
 *       "analyzisId": "5ed66cc0dbaee47acd2c1063",
 *       "_id": "5ed66cc0dbaee47acd2c1065",
 *       "name": "ch_662tF__NW001.mp3",
 *       "size": 339216,
 *       "mimeType": "audio/mpeg"
 *     }
 *   ]
 * }
 */
router.get('/uploads', authenticatedMiddleware(), asyncMiddleware(analyzisController.getUploads))

/**
 * @api {get} /analyzis/:analyzis Load an analyzis data
 * @apiVersion 0.1.0
 * @apiName AnalyzisData
 * @apiGroup Analyzis
 *
 * @apiParam {String} analyzisId Analyzis id
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *     "amplitude": [
 *       [0]
 *     ],
 *     "intensity": [
 *       [0]
 *     ],
 *     "pitch": [
 *       [0.02, 0],
 *       [0.03, 0]
 *     ],
 *     "_id": "5ed66cc0dbaee47acd2c1063",
 *     "amplitudePlotFile": "yh_662tF_amplitude.png",
 *     "intensityPlotFile": "yh_662tF_intensity.png",
 *     "pitchPlotFile": "yh_662tF_pitch.png",
 *     "name": "yh_662tF__NW001.mp3",
 *     "size": 339216,
 *     "mimeType": "audio/mpeg",
 *     "userId": "5ece75285e8a084208e0b0c4",
 *     "analyzisDate": "2020-06-02T15:14:24.182Z"
 *   }
 * }
 *
 * @apiError {Error} NotFound Analyzis not found.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Analyzis not found."
 * }
 */
router.get<{ analyzisId: string }>(
  '/analyzis/:analyzisId',
  authenticatedMiddleware(),
  // @ts-ignore
  asyncMiddleware(analyzisController.getAnalyzis)
)

/**
 * @api {get} /analyzis/:analyzis/:dataType Load an analyzis data file
 * @apiVersion 0.1.0
 * @apiName AnalyzisData
 * @apiGroup Analyzis
 *
 * @apiParam {String} analyzisId Analyzis id
 * @apiParam {String} dataType Type of data to load - { `file` } = original analyzed file, { `amplitude` | `intensity` | `pitch` } = plot image file
 *
 * @apiExample Example-usage:
 * GET /analyzis/5ed66cc0dbaee47acd2c1063/amplitude
 *
 * @apiSuccessExample {File} Success-Response:
 * HTTP/1.1 200 OK
 * BinaryData
 *
 * @apiError {Error} NotFound Analyzis not found.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Analyzis not found."
 * }
 *
 * @apiError {Error} BadDataType Invalid data type
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "Invalid plot data type."
 * }
 *
 * @apiError {Error} DataTypeNotAvailable Data type not available for this analyzis (i.e. you ask for a video-specific analyzis data type on an audio analyzis)
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 409 Conflict
 * {
 *   "message": "Asked data type is not available in this analyzis."
 * }
 */
router.get<{ analyzisId: string; dataType: AudioAnalyzisData | 'file' }>(
  '/analyzis/:analyzisId/:dataType',
  authenticatedMiddleware(),
  // @ts-ignore
  asyncMiddleware(analyzisController.getAnalyzisPlotFile)
)

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
