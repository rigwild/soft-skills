import { Request } from 'express'
import boom from '@hapi/boom'
import { validationResult, ErrorFormatter } from 'express-validator'

/**
 * `express-validator` middleware error formatter
 * `Field <error-message>`
 */
export const errorFormatter: ErrorFormatter = ({ msg, param }) =>
  `${param.slice(0, 1).toUpperCase()}${param.slice(1)} ${msg}`

/**
 * Run `express-validator` middleware input validation
 * @param req Express request
 * @throws 400 Bad Request
 */
export const runRequestValidator = (req: Request) => {
  const reqErrors = validationResult(req).formatWith(errorFormatter)
  if (!reqErrors.isEmpty()) throw boom.badRequest(undefined, reqErrors.mapped())
}

export const audioMimeTypes = new Set([
  'audio/basic',
  'audio/mid',
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/vnd.wav',
  'audio/vorbis',
  'audio/wav',
  'audio/wave',
  'audio/webm',
  'audio/x-aiff',
  'audio/x-mpegurl',
  'audio/x-pn-wav',
  'audio/x-wav',
  'auido/L24'
])

export const videoMimeTypes = new Set([
  'application/vnd.apple.mpegurl',
  'application/x-mpegurl',
  'video/3gpp',
  'video/mp2t',
  'video/mp4',
  'video/mpeg',
  'video/ms-asf',
  'video/ogg',
  'video/quicktime',
  'video/webm',
  'video/x-flv',
  'video/x-m4v',
  'video/x-matroska',
  'video/x-ms-wmv',
  'video/x-msvideo'
])

export const allowedMimeTypes = new Set([...audioMimeTypes, ...videoMimeTypes])

export const isAudioMimeType = (mimeType: string) => audioMimeTypes.has(mimeType.toLowerCase())
export const isVideoMimeType = (mimeType: string) => videoMimeTypes.has(mimeType.toLowerCase())
export const isAllowedMimeType = (mimeType: string) => allowedMimeTypes.has(mimeType.toLowerCase())
