import mongoose, { Schema } from 'mongoose'

import type { UploadAnalysedAudio } from '../../types'

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

export const AnalysisModel = mongoose.model<AnalysisDocument>('Analysis', AnalysisSchema)
