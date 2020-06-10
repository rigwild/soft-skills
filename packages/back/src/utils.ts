import { Request } from 'express'
import boom from '@hapi/boom'
import { validationResult, ErrorFormatter } from 'express-validator'

import { isTestEnv } from './config'

export const log = (data: string | object) => !isTestEnv && console.log(data)
export const logErr = (data: string | object) => !isTestEnv && console.error(data)
export const logDated = (data: string) => log(`${new Date().toJSON()} - ${data}`)

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
] as const)

export const isVideoMimeType = (mimeType: string) => videoMimeTypes.has(mimeType.toLowerCase() as any)
