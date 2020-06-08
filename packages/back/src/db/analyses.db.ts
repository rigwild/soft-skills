import mongoose, { Schema } from 'mongoose'
import boom from '@hapi/boom'

import { setOneUploadStateFromUser } from './user.db'
import { log } from '../utils'
import type { AudioAnalysis, UploadDB, UploadAnalysedAudio } from '../types'

export type AnalysisDocument = UploadAnalysedAudio & mongoose.Document

export const AnalysisSchema = new Schema({
  userId: { type: String, required: true },

  name: { type: String, required: true, unique: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },

  amplitude: { type: [[Number]], required: true },
  intensity: { type: [[Number]], required: true },
  pitch: { type: [[Number]], required: true },
  amplitudePlotFile: { type: String, required: true },
  intensityPlotFile: { type: String, required: true },
  pitchPlotFile: { type: String, required: true },

  analysisDate: {
    type: Date,
    default: () => new Date()
  }
})

export const AnalysisModel = mongoose.model<AnalysisDocument>('Analyses', AnalysisSchema)

/**
 * Add an analysis
 * @param userId The user id of the user who requested the analysis
 * @param analysis Analysis data
 */
export const addAnalysis = async (userId: string, file: UploadDB, analysis: AudioAnalysis) => {
  // Add the upload to the user uploads list
  const analysisDoc = await AnalysisModel.create({
    ...analysis,
    ...file,
    userId
  })

  if (!analysisDoc) throw boom.internal('Unexpected error when adding analysis.')

  // Set the file state as finished in the user uploads list
  await setOneUploadStateFromUser(userId, file._id, file.name, 'finished', analysisDoc._id)
  log(`Added an analysis. userId=${userId}, fileName=${file.name}`)
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
