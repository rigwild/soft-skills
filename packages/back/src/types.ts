import type { RequestHandler, Params, ParamsDictionary } from 'express-serve-static-core'
import type { ParsedQs } from 'qs'

export const uploadStates = ['pending', 'finished', 'error'] as const
export type UploadStates = typeof uploadStates[number]

export const analysisDataTypes = ['amplitude', 'intensity', 'pitch'] as const
export type AnalysisDataTypes = typeof analysisDataTypes[number]

const _analysisFiles = ['videoFile', 'audioFile', 'amplitudePlotFile', 'intensityPlotFile', 'pitchPlotFile'] as const
export const analysisFiles = new Set(_analysisFiles)
export type AnalysisFiles = typeof _analysisFiles[number]

export interface Upload {
  videoFile: string

  state: UploadStates

  uploadTimestamp: Date
  lastStateEditTimestamp: Date

  analysisId?: string
}

export interface AnalysisData {
  videoFile: string
  audioFile: string

  amplitude: number[][]
  intensity: number[][]
  pitch: number[][]

  amplitudePlotFile: string
  intensityPlotFile: string
  pitchPlotFile: string
}

export interface Analysis extends AnalysisData {
  userId: string
  uploadTimestamp: Date
  analysisTimestamp: Date
}

export interface User {
  _id: string
  email: string
  password: string
  name: string
  joinDate: Date
  uploads: UploadDB[]
}

interface IdDB {
  _id: string
}

export interface UploadDB extends Upload, IdDB {}
export interface AnalysisDB extends Analysis, IdDB {}
export interface UserDB extends User, IdDB {}

// `express.Request` with user data
export type RequestAuthed<
  P extends Params = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> = Parameters<RequestHandler<P, ResBody, ReqBody, ReqQuery>>[0] & {
  session: Pick<UserDB, '_id' | 'email' | 'name'>
  userDoc: Omit<UserDB, 'password'>
}
// `express.RequestHandler` with user data
export type RequestHandlerAuthed = (
  req: RequestAuthed,
  res: Parameters<RequestHandler>[1],
  next: Parameters<RequestHandler>[2]
) => ReturnType<RequestHandler>
