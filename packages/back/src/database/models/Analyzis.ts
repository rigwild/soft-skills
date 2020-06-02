import mongoose, { Schema } from 'mongoose'

import type { UploadAnalyzedAudio } from '../../types'

export type AnalyzisDocument = UploadAnalyzedAudio & mongoose.Document

export const AnalyzisSchema = new Schema({
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

  analyzisDate: {
    type: Date,
    default: () => new Date()
  }
})

export const AnalyzisModel = mongoose.model<AnalyzisDocument>('Analyzis', AnalyzisSchema)
