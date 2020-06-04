import type { RequestHandler, Params, ParamsDictionary } from 'express-serve-static-core'
import type { ParsedQs } from 'qs'

export type AudioAnalysisData = 'amplitude' | 'intensity' | 'pitch'

export interface Upload {
  name: string
  mimeType: string
  size: number
  state: 'pending' | 'finished' | 'error'
  analysisId?: string
}

export interface UploadDB extends Upload {
  _id: string
}

export interface Analysis extends Omit<Upload, 'analysisId' | 'state'> {
  _id: string
  userId: string
  analysisDate: Date
}

export interface AudioAnalysis {
  amplitude: number[][]
  intensity: number[][]
  pitch: number[][]
  amplitudePlotFile: string
  intensityPlotFile: string
  pitchPlotFile: string
}

export interface AnalysisDB extends Analysis {
  _id: string
}

export interface UploadAnalysedAudio extends Analysis, AudioAnalysis {}

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
