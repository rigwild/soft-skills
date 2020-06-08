import { Router } from 'express'

import { asyncMiddleware, authenticatedMiddleware } from '../middlewares'
import {
  uploadRequestHandler,
  getUploadsRequestHandler,
  getAnalysisRequestHandler,
  getAnalysisFileRequestHandler
} from '../controllers/analyses.controller'
import type { AnalysisFiles } from '../types'

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
 *     "state": "pending",
 *     "analysisId": null,
 *     "addedTimestamp": "2020-06-08T11:49:09.080Z",
 *     "lastStateEditTimestamp": "2020-06-08T11:49:09.080Z",
 *     "_id": "5ede25b5ee17b104bc23ba96",
 *     "videoFile": "2V4Fne8Z__VIDEO.mp4"
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
 *       "analysisId": null,
 *       "addedTimestamp": "2020-06-08T11:49:09.080Z",
 *       "lastStateEditTimestamp": "2020-06-08T11:49:21.683Z",
 *       "_id": "5ede25b5ee17b104bc23ba96",
 *       "videoFile": "1V4Fne8Z__VIDEO.mp4"
 *     },
 *     {
 *       "state": "error",
 *       "analysisId": null,
 *       "addedTimestamp": "2020-06-08T11:49:09.080Z",
 *       "lastStateEditTimestamp": "2020-06-08T11:49:21.683Z",
 *       "_id": "5ede25b5ee17b104bc23ba96",
 *       "videoFile": "2V4Fne8Z__VIDEO.mp4"
 *     },
 *     {
 *       "state": "finished",
 *       "analysisId": "5ed66cc0dbaee47acd2c1063",
 *       "addedTimestamp": "2020-06-08T11:49:09.080Z",
 *       "lastStateEditTimestamp": "2020-06-08T11:49:21.683Z",
 *       "_id": "5ede25b5ee17b104bc23ba96",
 *       "videoFile": "3V4Fne8Z__VIDEO.mp4"
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
 *       [0.02, 0],
 *       [0.03, 0]
 *     ],
 *     "intensity": [
 *       [0.02, 0],
 *       [0.03, 0]
 *     ],
 *     "pitch": [
 *       [0.02, 0],
 *       [0.03, 0]
 *     ],
 *     "_id": "5ede25c1ee17b104bc23ba97",
 *     "userId": "5eda45b94e213d048bfa7a21",
 *     "videoFile": "2V4Fne8Z__VIDEO.mp4",
 *     "audioFile": "2V4Fne8Z__VIDEO.mp4.wav",
 *     "amplitudePlotFile": "2V4Fne8Z_amplitude.png",
 *     "intensityPlotFile": "2V4Fne8Z_intensity.png",
 *     "pitchPlotFile": "2V4Fne8Z_pitch.png",
 *     "uploadTimestamp": "2020-06-08T11:49:09.080Z",
 *     "analysisTimestamp": "2020-06-08T11:49:21.577Z"
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
 * @api {get} /analysis/:analysis/:file Load an analysis data file
 * @apiVersion 0.1.0
 * @apiName AnalysisData
 * @apiGroup Analysis
 *
 * @apiParam {String} analysisId Analysis id
 * @apiParam {String} file Type of data to load - 'videoFile' | 'audioFile' | 'amplitudePlotFile' | 'intensityPlotFile' | 'pitchPlotFile'
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
 * @apiError {Error} InvalidFileKey Provided file key is invalid
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "Provided file key is invalid."
 * }
 */
router.get<{ analysisId: string; file: AnalysisFiles }>(
  '/analysis/:analysisId/:file',
  authenticatedMiddleware(),
  // @ts-ignore
  asyncMiddleware(getAnalysisFileRequestHandler)
)

export default router
