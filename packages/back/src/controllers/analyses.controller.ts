import path from 'path'
import { Response } from 'express'
import boom from '@hapi/boom'
import { nanoid } from 'nanoid'

import { UPLOADS_DIR } from '../config'
import { addUploadToUser, setOneUploadStateFromUser, findUser, addAnalysis, findAnalysis, AnalysisModel } from '../db'
import { analyseAudio } from '../scripts/runner'
import { isAllowedMimeType, logDated, logErr } from '../utils'
import type { RequestAuthed, Upload, UploadDB, AudioAnalysisData } from '../types'

export const uploadRequestHandler = async (reqRaw: RequestAuthed, res: Response) => {
  const req = reqRaw as typeof reqRaw & { files: any }

  // Check a file was uploaded
  const content = req?.files?.content as Upload & { mimetype: string; mv: (path: string) => Promise<void> }
  if (!req.files || !content) throw boom.badRequest('You need to send a file.')
  content.mimeType = content.mimetype

  // Check file mime type
  if (!isAllowedMimeType(content.mimeType)) throw boom.badRequest('You need to send an audio or video file.')

  // Add a unique identifier to dodge filename collisions
  const uniqueId = nanoid(8)

  content.name = `${uniqueId}_${content.name}`
  const file = path.resolve(UPLOADS_DIR, content.name)

  await content.mv(file)
  const uploadedData = (await addUploadToUser(req.session._id, content)) as UploadDB

  res.json({
    data: {
      name: content.name,
      mimeType: content.mimeType,
      size: content.size
    }
  })

  // Start a background analysis
  try {
    // TODO: Support video analysis
    logDated(`Starting analysis for file "${content.name}" from user=${req.session.email}`)
    const analysis = await analyseAudio(file, uniqueId)

    // Convert file paths to only file names
    analysis.amplitudePlotFile = path.basename(analysis.amplitudePlotFile)
    analysis.intensityPlotFile = path.basename(analysis.intensityPlotFile)
    analysis.pitchPlotFile = path.basename(analysis.pitchPlotFile)

    logDated(`Successful analysis for file "${content.name}" from user=${req.session.email}`)
    await addAnalysis(req.session._id, uploadedData, analysis)
  } catch (error) {
    // We catch all errors as a response was already sent

    // Set the file state as error in the user uploads list
    await setOneUploadStateFromUser(req.session._id, uploadedData._id, content.name, 'error').catch(err => logErr(err))
    logErr(error)
  }
}

export const getUploadsRequestHandler = async (req: RequestAuthed, res: Response) => {
  const profile = await findUser(req.session._id)
  res.json({ data: profile.uploads })
}

export const getAnalysisRequestHandler = async (req: RequestAuthed<{ analysisId: string }>, res: Response) => {
  const analysis = await findAnalysis(req.params.analysisId)
  res.json({ data: analysis.toObject({ versionKey: false }) })
}

export const getAnalysisPlotFileRequestHandler = async (
  req: RequestAuthed<{ analysisId: string; dataType: AudioAnalysisData | 'file' }>,
  res: Response
) => {
  const dataType = req.params.dataType
  const dataTypeKey = (`${dataType}PlotFile` as any) as 'amplitudePlotFile' | 'intensityPlotFile' | 'pitchPlotFile'

  // Check the user asked for a valid data type
  if (!['file', 'amplitude', 'intensity', 'pitch'].some(x => x === dataType))
    throw boom.badRequest('Invalid plot data type.')

  // Get analysis data
  const analysis = await AnalysisModel.findOne(
    { _id: req.params.analysisId, userId: req.session._id },
    {
      name: 1,
      amplitudePlotFile: 1,
      intensityPlotFile: 1,
      pitchPlotFile: 1
    }
  )
  if (!analysis) throw boom.notFound('Analysis not found.')

  if (dataType === 'file') {
    // Send the original file
    res.sendFile(path.resolve(UPLOADS_DIR, analysis.name))
    return
  } else if (!!analysis[dataTypeKey]) {
    // Send the plot image
    res.sendFile(path.resolve(UPLOADS_DIR, analysis[dataTypeKey]))
    return
  }

  // Can be thrown if asked for a data type not available (i.e. a video data type for an audio analysis)
  throw boom.conflict('Asked data type is not available in this analysis.')
}

// TODO: Add errored-out analysis retry
