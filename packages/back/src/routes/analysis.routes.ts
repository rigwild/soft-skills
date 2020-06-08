import { Router } from 'express'

import { asyncMiddleware, authenticatedMiddleware } from '../middlewares'
import {
  uploadRequestHandler,
  getUploadsRequestHandler,
  getAnalysisRequestHandler,
  getAnalysisPlotFileRequestHandler
} from '../controllers/analyses.controller'
import type { AudioAnalysisData } from '../types'

const router = Router()

/**
 * @api {post} /uploads Upload a file for analysis
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
router.post('/uploads', authenticatedMiddleware(), asyncMiddleware(uploadRequestHandler))

/**
 * @api {get} /uploads Get the list of all files sent for analysis
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
 *       "analysisId": "5ed66cc0dbaee47acd2c1063",
 *       "_id": "5ed66cc0dbaee47acd2c1065",
 *       "name": "ch_662tF__NW001.mp3",
 *       "size": 339216,
 *       "mimeType": "audio/mpeg"
 *     }
 *   ]
 * }
 */
router.get('/uploads', authenticatedMiddleware(), asyncMiddleware(getUploadsRequestHandler))

/**
 * @api {get} /analysis/:analysis Load an analysis data
 * @apiVersion 0.1.0
 * @apiName AnalysisData
 * @apiGroup Analysis
 *
 * @apiParam {String} analysisId Analysis id
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
 *     "analysisDate": "2020-06-02T15:14:24.182Z"
 *   }
 * }
 *
 * @apiError {Error} NotFound Analysis not found.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Analysis not found."
 * }
 */
router.get<{ analysisId: string }>(
  '/analysis/:analysisId',
  authenticatedMiddleware(),
  // @ts-ignore
  asyncMiddleware(getAnalysisRequestHandler)
)

/**
 * @api {get} /analysis/:analysis/:dataType Load an analysis data file
 * @apiVersion 0.1.0
 * @apiName AnalysisData
 * @apiGroup Analysis
 *
 * @apiParam {String} analysisId Analysis id
 * @apiParam {String} dataType Type of data to load - { `file` } = original analysed file, { `amplitude` | `intensity` | `pitch` } = plot image file
 *
 * @apiExample Example-usage:
 * GET /analysis/5ed66cc0dbaee47acd2c1063/amplitude
 *
 * @apiSuccessExample {File} Success-Response:
 * HTTP/1.1 200 OK
 * BinaryData
 *
 * @apiError {Error} NotFound Analysis not found.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Analysis not found."
 * }
 *
 * @apiError {Error} BadDataType Invalid data type
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "Invalid plot data type."
 * }
 *
 * @apiError {Error} DataTypeNotAvailable Data type not available for this analysis (i.e. you ask for a video-specific analysis data type on an audio analysis)
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 409 Conflict
 * {
 *   "message": "Asked data type is not available in this analysis."
 * }
 */
router.get<{ analysisId: string; dataType: AudioAnalysisData | 'file' }>(
  '/analysis/:analysisId/:dataType',
  authenticatedMiddleware(),
  // @ts-ignore
  asyncMiddleware(getAnalysisPlotFileRequestHandler)
)

export default router
