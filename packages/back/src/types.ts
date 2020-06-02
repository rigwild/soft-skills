import type { RequestHandler, Params, ParamsDictionary } from 'express-serve-static-core'
import type { ParsedQs } from 'qs'

export type AudioAnalyzisData = 'amplitude' | 'intensity' | 'pitch'

export interface Upload {
  name: string
  mimeType: string
  size: number
  state: 'pending' | 'finished' | 'error'
  analyzisId?: string
}

export interface UploadDB extends Upload {
  _id: string
}

export interface Analyzis extends Omit<Upload, 'analyzisId' | 'state'> {
  _id: string
  userId: string
  analyzisDate: Date
}

export interface AudioAnalyzis {
  amplitude: number[][]
  intensity: number[][]
  pitch: number[][]
  amplitudePlotFile: string
  intensityPlotFile: string
  pitchPlotFile: string
}

export interface AnalyzisDB extends Analyzis {
  _id: string
}

export interface UploadAnalyzedAudio extends Analyzis, AudioAnalyzis {}

export interface User {
  _id: string
  email: string
  password: string
  name: string
  joinDate: Date
  uploads: UploadDB[]
}

// `express.Request` with user data
export type RequestAuthed<
  P extends Params = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> = Parameters<RequestHandler<P, ResBody, ReqBody, ReqQuery>>[0] & {
  session: Pick<User, '_id' | 'email' | 'name'>
  userDoc: Omit<User, 'password'>
}
// `express.RequestHandler` with user data
export type RequestHandlerAuthed = (
  req: RequestAuthed,
  res: Parameters<RequestHandler>[1],
  next: Parameters<RequestHandler>[2]
) => ReturnType<RequestHandler>
