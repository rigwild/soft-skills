import path from 'path'
import mongoose, { Schema } from 'mongoose'
import boom from '@hapi/boom'

import { setOneUploadStateFromUser, UserModel } from './user.db'
import { log } from '../utils'
import type { UploadDB, Analysis, AnalysisData } from '../types'

export type AnalysisDocument = Analysis & mongoose.Document

export const AnalysisSchema = new Schema({
  userId: { type: String, required: true },

  name: { type: String, required: true },
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
 * @param file Uploaded file data from `users.uploads`
 * @param analysis Analysis data
 */
export const addAnalysis = async (userId: string, file: UploadDB, analysis: AnalysisData) => {
  // Add the upload to the user uploads list
  const analysisDoc = await AnalysisModel.create({
    userId,

    name: file.name,
    videoFile: path.basename(analysis.videoFile),
    audioFile: path.basename(analysis.audioFile),

    amplitude: analysis.amplitude,
    intensity: analysis.intensity,
    pitch: analysis.pitch,

    amplitudePlotFile: path.basename(analysis.amplitudePlotFile),
    intensityPlotFile: path.basename(analysis.intensityPlotFile),
    pitchPlotFile: path.basename(analysis.pitchPlotFile),

    uploadTimestamp: file.uploadTimestamp
  })

  if (!analysisDoc) throw boom.internal('Unexpected error when adding analysis.')

  // Set the file state as finished in the user uploads list
  await setOneUploadStateFromUser(userId, file._id, file.videoFile, 'finished', analysisDoc._id)
  log(`Added an analysis. userId=${userId}, fileName=${file.videoFile}`)
}

/**
 * Edit an analysis. Will also edit it from the `users.uploads` array.
 * @param userId
 * @param uploadId
 * @param newName New analysis name
 */
export const editAnalysis = async (userId: string, uploadId: string, newName: string) => {
  const userDoc = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      'uploads._id': uploadId
    },
    { 'uploads.$.name': newName },
    { new: true }
  )
  if (!userDoc) throw boom.notFound('Analysis not found.')

  // Find the analysisId
  const analysisId = userDoc.uploads.find(x => x._id.toString() === uploadId || x.analysisId === uploadId)?.analysisId

  // If the provided id is an analysisId, we can rename the analysis document
  if (analysisId) await AnalysisModel.findByIdAndUpdate(analysisId, { name: newName })

  log(`Edited an analysis. userId=${userId}, analysisId=${uploadId}, newName=${newName}`)
}

/**
 * Delete an analysis. Will also remove it from the `users.uploads` array. Accepts analysisId or uploadId (for failed analyses)
 * @param userId
 * @param analysisIdOrUploadId
 */
export const deleteAnalysis = async (userId: string, analysisIdOrUploadId: string) => {
  // Remove from the uploads of the user
  const userDocBeforeUpdate = await UserModel.findByIdAndUpdate(userId, {
    $pull: {
      uploads: {
        $or: [{ _id: analysisIdOrUploadId }, { analysisId: analysisIdOrUploadId }]
      } as any
    }
  })
  if (!userDocBeforeUpdate) throw boom.notFound('Analysis not found.')

  // Find the analysisId
  const analysisId = userDocBeforeUpdate.uploads.find(
    x => x._id.toString() === analysisIdOrUploadId || x.analysisId === analysisIdOrUploadId
  )?.analysisId

  // If the provided id is an analysisId, we can remove the analysis document
  if (analysisId) await AnalysisModel.findByIdAndRemove(analysisId)

  log(`Removed an analysis. userId=${userId}, analysisId=${analysisIdOrUploadId}`)
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
