import path from 'path'
import { Response } from 'express'
import boom from '@hapi/boom'
import { nanoid } from 'nanoid'

import { UPLOADS_DIR } from '../config'
import {
  addUploadToUser,
  setOneUploadStateFromUser,
  addAnalysis,
  findAnalysis,
  AnalysisModel,
  deleteAnalysis,
  getUserUploads,
  editAnalysis,
  getUserUploadById
} from '../db'
import { analyseVideo } from '../scripts/runner'
import { isVideoMimeType, logDated, logErr, fileExists, runRequestValidator } from '../utils'
import { RequestAuthed, analysisFiles, AnalysisFiles, Upload } from '../types'

const startAnalysis = async (userId: string, uploadId: string, file: string) => {
  const fileName = path.basename(file)
  try {
    logDated(`Starting analysis for file "${fileName}" from user=${userId}`)
    const analysis = await analyseVideo(file)

    // We do it there to dodge race conditions (like renaming an upload while running an analysis)
    const uploadedData = await getUserUploadById(userId, uploadId)
    await addAnalysis(userId, uploadedData, analysis)

    logDated(`Successful analysis for file "${fileName}" from user=${userId}`)
  } catch (error) {
    // Set the file state as error in the user uploads list
    await setOneUploadStateFromUser(userId, uploadId, fileName, 'error', undefined, error.message)
    logErr(error)
  }
}

export const uploadFileRequestHandler = async (reqRaw: RequestAuthed, res: Response) => {
  const req = reqRaw as typeof reqRaw & { files: any }

  // Check a file was uploaded
  const upload = req?.files?.content
  if (!req.files || !upload) throw boom.badRequest('You need to send a file.')

  // Check file mime type
  if (!isVideoMimeType(upload.mimetype)) throw boom.badRequest('You need to send a video file.')

  // Add a unique identifier to dodge filename collisions
  const uniqueId = nanoid(8)
  const fileName = `${uniqueId}_${upload.name}`
  const file = path.resolve(UPLOADS_DIR, fileName)

  // Move the downloaded file to the `uploads` directory
  await upload.mv(file)

  const uploadedData = await addUploadToUser(req.session._id, fileName)

  res.json({ data: uploadedData })

  // Start a background analysis
  try {
    await startAnalysis(req.session._id, uploadedData._id, file)
  } catch (error) {
    logErr(error)
  }
}

export const retryAnalysisRequestHandler = async (req: RequestAuthed<{ uploadId: string }>, res: Response) => {
  // Load the requested upload data
  const toRetry = await getUserUploadById(req.session._id, req.params.uploadId)

  if (!toRetry) throw boom.notFound('Upload not found.')
  if (toRetry.state !== 'error') throw boom.conflict('You can only retry failed analyses.')
  if (!!toRetry.analysisId) throw boom.conflict('This file has already been analysed.')

  const filePath = path.resolve(UPLOADS_DIR, toRetry.videoFile)
  if (!(await fileExists(filePath)))
    throw boom.internal(
      'The video file was not found on the server. ' +
        'You might want to remove this upload as the file was probably removed from the server.'
    )

  await setOneUploadStateFromUser(req.session._id, toRetry._id, toRetry.videoFile, 'pending')
  toRetry.errorMessage = null as any
  toRetry.state = 'pending'
  res.json({ data: toRetry })

  // Retry the analysis in the background
  try {
    await startAnalysis(req.session._id, toRetry._id, filePath)
  } catch (error) {
    logErr(error)
  }
}

export const getUploadsRequestHandler = async (req: RequestAuthed, res: Response) => {
  res.json({ data: await getUserUploads(req.session._id) })
}

export const getAnalysisRequestHandler = async (req: RequestAuthed<{ analysisId: string }>, res: Response) => {
  res.json({ data: await findAnalysis(req.params.analysisId) })
}

export const editAnalysisRequestHandler = async (
  req: RequestAuthed<{ uploadId: string }, any, Pick<Upload, 'name'>>,
  res: Response
) => {
  runRequestValidator(req)

  await editAnalysis(req.session._id, req.params.uploadId, req.body.name)
  res.end()
}

export const deleteAnalysisRequestHandler = async (
  req: RequestAuthed<{ analysisIdOrUploadId: string }>,
  res: Response
) => {
  await deleteAnalysis(req.session._id, req.params.analysisIdOrUploadId)
  res.end()
}

export const getAnalysisFileRequestHandler = async (
  req: RequestAuthed<{ analysisId: string; file: AnalysisFiles }>,
  res: Response
) => {
  const file = req.params.file

  // Check the user asked for a valid data type
  if (!analysisFiles.has(file)) throw boom.badRequest('Provided file key is invalid.')

  // Get analysis data
  const analysis = await AnalysisModel.findOne({ _id: req.params.analysisId, userId: req.session._id }, { [file]: 1 })
  if (!analysis) throw boom.notFound('Analysis not found.')

  res.sendFile(path.resolve(UPLOADS_DIR, analysis[file]))
}

// TODO: Add errored-out analysis retry
