import path from 'path'
import { Response } from 'express'
import boom from '@hapi/boom'
import { nanoid } from 'nanoid'

import { UPLOADS_DIR } from '../config'
import { UserController } from '../database/controllers/User'
import { analyzeAudio } from '../scripts/runner'
import { isAllowedMimeType } from '../utils'
import { AnalyzisController } from '../database/controllers/Analyzis'
import type { RequestAuthed, Upload, UploadDB, AudioAnalyzisData } from '../types'

export class UploadController {
  public async upload(reqRaw: RequestAuthed, res: Response) {
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
    const uploadedData = (await UserController.addUpload(req.session._id, content)) as UploadDB

    res.json({
      data: {
        name: content.name,
        mimeType: content.mimeType,
        size: content.size
      }
    })

    // Start a background analyzis
    try {
      // TODO: Support video analyzis
      if (process.env.NODE_ENV !== 'test')
        console.log(
          `${new Date().toJSON()} - Starting analyzis for file "${content.name}" from user=${req.session.email}`
        )
      const analyzis = await analyzeAudio(file, uniqueId)

      // Convert file paths to only file names
      analyzis.amplitudePlotFile = path.basename(analyzis.amplitudePlotFile)
      analyzis.intensityPlotFile = path.basename(analyzis.intensityPlotFile)
      analyzis.pitchPlotFile = path.basename(analyzis.pitchPlotFile)

      if (process.env.NODE_ENV !== 'test')
        console.log(
          `${new Date().toJSON()} - Successful analyzis for file "${content.name}" from user=${req.session.email}`
        )
      await AnalyzisController.addAnalyzis(req.session._id, uploadedData, analyzis)
    } catch (error) {
      // We catch all errors as a response was already sent

      // Set the file state as error in the user uploads list
      await UserController.setUploadState(req.session._id, uploadedData._id, content.name, 'error').catch(err =>
        console.error(err)
      )
      console.error(error)
    }
  }

  public async getUploads(req: RequestAuthed, res: Response) {
    const profile = await UserController.find(req.session._id)
    res.json({ data: profile.uploads })
  }

  public async getAnalyzis(req: RequestAuthed<{ analyzisId: string }>, res: Response) {
    const analyzis = await AnalyzisController.find(req.params.analyzisId)
    res.json({ data: analyzis.toObject({ versionKey: false }) })
  }

  public async getAnalyzisPlotFile(
    req: RequestAuthed<{ analyzisId: string; dataType: AudioAnalyzisData | 'file' }>,
    res: Response
  ) {
    const dataType = req.params.dataType
    const dataTypeKey = (`${dataType}PlotFile` as any) as 'amplitudePlotFile' | 'intensityPlotFile' | 'pitchPlotFile'

    // Check the user asked for a valid data type
    if (!['file', 'amplitude', 'intensity', 'pitch'].some(x => x === dataType))
      throw boom.badRequest('Invalid plot data type.')

    // Get analyzis data
    const analyzis = await AnalyzisController.Model.findOne(
      { _id: req.params.analyzisId, userId: req.session._id },
      {
        name: 1,
        amplitudePlotFile: 1,
        intensityPlotFile: 1,
        pitchPlotFile: 1
      }
    )
    if (!analyzis) throw boom.notFound('Analyzis not found.')

    if (dataType === 'file') {
      // Send the original file
      res.sendFile(path.resolve(UPLOADS_DIR, analyzis.name))
      return
    } else if (!!analyzis[dataTypeKey]) {
      // Send the plot image
      res.sendFile(path.resolve(UPLOADS_DIR, analyzis[dataTypeKey]))
      return
    }

    // Can be thrown if asked for a data type not available (i.e. a video data type for an audio analyzis)
    throw boom.conflict('Asked data type is not available in this analyzis.')
  }

  // TODO: Add errored-out analyzis retry
}

export default new UploadController()
