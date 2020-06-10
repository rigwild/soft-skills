import path from 'path'
import { Response } from 'express'
import boom from '@hapi/boom'
import { nanoid } from 'nanoid'

import { UPLOADS_DIR } from '../config'
import { addUploadToUser, setOneUploadStateFromUser, findUser, addAnalysis, findAnalysis, AnalysisModel } from '../db'
import { analyseVideo } from '../scripts/runner'
import { isVideoMimeType, logDated, logErr } from '../utils'
import { RequestAuthed, analysisFiles, AnalysisFiles } from '../types'

export const uploadRequestHandler = async (reqRaw: RequestAuthed, res: Response) => {
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
    // TODO: Support video analysis
    logDated(`Starting analysis for file "${fileName}" from user=${req.session.email}`)
    const analysis = await analyseVideo(file, uniqueId)

    // Convert file paths to only file names
    analysis.videoFile = path.basename(analysis.videoFile)
    analysis.audioFile = path.basename(analysis.audioFile)
    analysis.amplitudePlotFile = path.basename(analysis.amplitudePlotFile)
    analysis.intensityPlotFile = path.basename(analysis.intensityPlotFile)
    analysis.pitchPlotFile = path.basename(analysis.pitchPlotFile)

    logDated(`Successful analysis for file "${fileName}" from user=${req.session.email}`)
    await addAnalysis(req.session._id, uploadedData, analysis)
  } catch (error) {
    // We catch all errors as a response was already sent

    // Set the file state as error in the user uploads list
    await setOneUploadStateFromUser(req.session._id, uploadedData._id, fileName, 'error').catch(err => logErr(err))
    logErr(error)
  }
}

export const getUploadsRequestHandler = async (req: RequestAuthed, res: Response) => {
  const profile = await findUser(req.session._id)
  // Sort by most recently uploaded is first
  res.json({ data: profile.uploads.sort((a, b) => (a.uploadTimestamp < b.uploadTimestamp ? 1 : -1)) })
}

export const getAnalysisRequestHandler = async (req: RequestAuthed<{ analysisId: string }>, res: Response) => {
  const analysis = await findAnalysis(req.params.analysisId)
  res.json({ data: analysis.toObject({ versionKey: false }) })
}

export const getAnalysisFileRequestHandler = async (
  req: RequestAuthed<{ analysisId: string; file: AnalysisFiles }>,
  res: Response
) => {
  const file = req.params.file

  // Check the user asked for a valid data type
  if (analysisFiles.indexOf(file) === -1) throw boom.badRequest('Provided file key is invalid.')

  // Get analysis data
  const analysis = await AnalysisModel.findOne({ _id: req.params.analysisId, userId: req.session._id }, { [file]: 1 })
  if (!analysis) throw boom.notFound('Analysis not found.')

  res.sendFile(path.resolve(UPLOADS_DIR, analysis[file]))
}

// TODO: Add errored-out analysis retry
