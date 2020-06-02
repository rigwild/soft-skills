import path from 'path'
import { Response } from 'express'
import boom from '@hapi/boom'
import { nanoid } from 'nanoid'

import { UPLOADS_DIR } from '../config'
import { UserController } from '../database/controllers/User'
import { analyzeAudio } from '../scripts/runner'
import { isAllowedMimeType } from '../utils'
import { AnalyzisController } from '../database/controllers/Analyzis'
import type { RequestAuthed, Upload, UploadDB } from '../types'

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

    res.status(200).end()

    // Start a background analyzis
    try {
      // TODO: Support video analyzis
      console.log(
        `${new Date().toJSON()} - Starting analyzis for file "${content.name}" from user=${req.session.email}`
      )
      const analyzis = await analyzeAudio(file, uniqueId)

      // Convert file paths to only file names
      analyzis.amplitudePlotFilePath = path.basename(analyzis.amplitudePlotFilePath)
      analyzis.intensityPlotFilePath = path.basename(analyzis.intensityPlotFilePath)
      analyzis.pitchPlotFilePath = path.basename(analyzis.pitchPlotFilePath)

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

  // TODO: Add errored-out analyzis retry
}

export default new UploadController()
