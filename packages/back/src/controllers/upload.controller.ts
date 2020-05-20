import path from 'path'
import { Response } from 'express'
import boom from '@hapi/boom'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nanoid = require('nanoid').nanoid

import { UPLOADS_DIR } from '../config'
import { RequestAuthed } from '../types'
import { UserController } from '../database/controllers/User'

const allowedMimeTypes = [
  'application/ogg',
  'application/x-mpegurl',
  'audio/ogg',
  'audio/wav',
  'audio/wave',
  'audio/webm',
  'audio/x-pn-wav',
  'audio/x-wav',
  'video/3gpp',
  'video/mp2t',
  'video/mp4',
  'video/ogg',
  'video/quicktime',
  'video/webm',
  'video/x-flv',
  'video/x-ms-wmv',
  'video/x-msvideo'
]

export class UploadController {
  public async upload(reqRaw: RequestAuthed, res: Response) {
    const req = reqRaw as typeof reqRaw & { files: any }
    console.log(req.files)

    // Check a file was uploaded
    const content = req?.files?.content
    if (!req.files || !content) throw boom.badRequest('You need to send a file.')

    // Check file mime type
    if (!allowedMimeTypes.includes(content.mimetype.toLowerCase()))
      throw boom.badRequest('You need to send an audio or video file.')
    
    // Add a unique identifier to dodge filename collisions
    content.name = `${nanoid(6)}-${content.name}`
    
    await content.mv(path.resolve(UPLOADS_DIR, content.name))
    await UserController.addUpload(req.session._id, content)
    
    res.status(200).end()
  }
}

export default new UploadController()   
