import mongoose, { Schema } from 'mongoose'
import boom from '@hapi/boom'

import { setOneUploadStateFromUser } from './user.db'
import { log } from '../utils'
import type { UploadDB, Analysis } from '../types'

export type AnalysisDocument = Analysis & mongoose.Document

export const AnalysisSchema = new Schema({
  userId: { type: String, required: true },

  videoFile: { type: String, required: true, unique: true },
  audioFile: { type: String, required: true },

  amplitude: { type: [[Number]], required: true },
  intensity: { type: [[Number]], required: true },
  pitch: { type: [[Number]], required: true },

  amplitudePlotFile: { type: String, required: true },
  intensityPlotFile: { type: String, required: true },
  pitchPlotFile: { type: String, required: true },

  uploadTimestamp: { type: Date, required: true },
  analysisTimestamp: { type: Date, default: () => new Date() }
})

export const AnalysisModel = mongoose.model<AnalysisDocument>('Analyses', AnalysisSchema)

/**
 * Add an analysis
 * @param userId The user id of the user who requested the analysis
 * @param analysis Analysis data
 */
export const addAnalysis = async (
  userId: string,
  file: UploadDB,
  analysis: Omit<Analysis, 'userId' | 'uploadTimestamp' | 'analysisTimestamp'>
) => {
  // Add the upload to the user uploads list
  const analysisDoc = await AnalysisModel.create({
    userId,

    videoFile: analysis.videoFile,
    audioFile: analysis.audioFile,

    amplitude: analysis.amplitude,
    intensity: analysis.intensity,
    pitch: analysis.pitch,

    amplitudePlotFile: analysis.amplitudePlotFile,
    intensityPlotFile: analysis.intensityPlotFile,
    pitchPlotFile: analysis.pitchPlotFile,

    uploadTimestamp: file.addedTimestamp
  })

  if (!analysisDoc) throw boom.internal('Unexpected error when adding analysis.')

  // Set the file state as finished in the user uploads list
  await setOneUploadStateFromUser(userId, file._id, file.videoFile, 'finished', analysisDoc._id)
  log(`Added an analysis. userId=${userId}, fileName=${file.videoFile}`)
}

/**
 * Find an analysis
 * @param analysisId The analysis id
 * @returns The analysis's data
 * @throws Could not find the analysis
 */
export const findAnalysis = async (analysisId: string) => {
  const analysis = await AnalysisModel.findById(analysisId)
  if (!analysis) throw boom.notFound('Analysis not found.')
  return analysis
}
