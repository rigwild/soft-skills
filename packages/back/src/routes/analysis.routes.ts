import { Router } from 'express'

import { asyncMiddleware, authenticatedMiddleware } from '../middlewares'
import {
  uploadFileRequestHandler,
  getUploadsRequestHandler,
  getAnalysisRequestHandler,
  getAnalysisFileRequestHandler,
  deleteAnalysisRequestHandler,
  retryAnalysisRequestHandler
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
 *     "uploadTimestamp": "2020-06-08T11:49:09.080Z",
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
 * @apiError {Error} BadMimeType You need to send a video file.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "You need to send a video file."
 * }
 */
router.post('/uploads', authenticatedMiddleware(), asyncMiddleware(uploadFileRequestHandler))

/**
 * @api {get} /uploads Get the list of all files sent for analysis
 * @apiDescription Files are sorted by uploadTimestamp desc.
 * @apiVersion 0.1.0
 * @apiName UploadedFiles
 * @apiGroup Uploads
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": [
 *     {
 *         "state": "pending",
 *         "analysisId": "5edfa469b0996303bfac4054",
 *         "uploadTimestamp": "2020-06-09T15:01:42.886Z",
 *         "lastStateEditTimestamp": "2020-06-09T15:02:01.479Z",
 *         "_id": "5edfa456b0996303bfac4053",
 *         "videoFile": "3x46l715_upload.webm"
 *     },
 *     {
 *         "state": "error",
 *         "errorMessage": "Command failed with exit code 1: pytho...",
 *         "analysisId": "5edf9fceb0996303bfac4052",
 *         "uploadTimestamp": "2020-06-09T14:42:05.643Z",
 *         "lastStateEditTimestamp": "2020-06-09T14:42:22.244Z",
 *         "_id": "5edf9fbdb0996303bfac4051",
 *         "videoFile": "2uLgBYY0_upload.webm"
 *     },
 *     {
 *         "state": "finished",
 *         "analysisId": "5edf9873b0996303bfac4050",
 *         "uploadTimestamp": "2020-06-09T14:10:28.124Z",
 *         "lastStateEditTimestamp": "2020-06-09T14:11:00.153Z",
 *         "_id": "5edf9854b0996303bfac404f",
 *         "videoFile": "1lg55iA7_upload.webm"
 *     }
 *   ]
 * }
 */
router.get('/uploads', authenticatedMiddleware(), asyncMiddleware(getUploadsRequestHandler))

/**
 * @api {post} /uploads/:uploadId/retry Retry a previously failed analysis
 * @apiVersion 0.1.0
 * @apiName RetryAnalysis
 * @apiGroup Uploads
 *
 * @apiParam {String} uploadId Upload id which analysis' failed
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "data": {
 *     "state": "pending",
 *     "errorMessage": null,
 *     "analysisId": null,
 *     "uploadTimestamp": "2020-06-08T11:49:09.080Z",
 *     "lastStateEditTimestamp": "2020-06-08T11:49:09.080Z",
 *     "_id": "5ede25b5ee17b104bc23ba96",
 *     "videoFile": "2V4Fne8Z__VIDEO.mp4"
 *   }
 * }
 *
 * @apiError {Error} NotFound Upload not found.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Upload not found."
 * }
 *
 * @apiError {Error} NotAnalysisError The upload state is not `error`
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 409 Conflict
 * {
 *   "message": "You can only retry failed analyses."
 * }
 *
 * @apiError {Error} AlreadyAnalysed This upload was already analysed
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 409 Conflict
 * {
 *   "message": "This file has already been analysed."
 * }
 *
 * @apiError {Error} VideoFileRemoved The video file can't be found or has been removed from the server
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "message": "The video file was not found on the server. You might want to remove this upload as the file was probably removed from the server."
 * }
 */
router.post<{ uploadId: string }>(
  '/uploads/:uploadId/retry',
  authenticatedMiddleware(),
  // @ts-ignore
  asyncMiddleware(retryAnalysisRequestHandler)
)

/**
 * @api {get} /analysis/:analysisId Load an analysis data
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
 * @api {delete} /analysis/:analysisIdOrUploadId Delete an analysis
 * @apiDescription Remove the analysis data and the file in the user's uploads list - Accepts analysisId or uploadId
 * @apiVersion 0.1.0
 * @apiName AnalysisDelete
 * @apiGroup Analysis
 *
 * @apiParam {String} analysisIdOrUploadId Analysis id
 *
 * @apiSuccessExample {String} Success-Response:
 * HTTP/1.1 200 OK
 *
 * @apiError {Error} NotFound Analysis not found.
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Analysis not found."
 * }
 */
router.delete<{ analysisIdOrUploadId: string }>(
  '/analysis/:analysisIdOrUploadId',
  authenticatedMiddleware(),
  // @ts-ignore
  asyncMiddleware(deleteAnalysisRequestHandler)
)

/**
 * @api {get} /analysis/:analysis/:file Load an analysis data file
 * @apiVersion 0.1.0
 * @apiName AnalysisDataFile
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
