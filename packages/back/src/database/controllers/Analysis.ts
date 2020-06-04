import boom from '@hapi/boom'

import { AnalysisModel } from '../models/Analysis'
import { UserController } from './User'
import type { AudioAnalysis, UploadDB } from '../../types'

export const AnalysisController = {
  get Model() {
    return AnalysisModel
  },

  log(data: string | object) {
    if (process.env.NODE_ENV !== 'test') console.log(data)
  },

  /**
   * Add an analysis
   * @param userId The user id of the user who requested the analysis
   * @param analysis Analysis data
   */
  async addAnalysis(userId: string, file: UploadDB, analysis: AudioAnalysis) {
    // Add the upload to the user uploads list
    const analysisDoc = await AnalysisModel.create({
      ...analysis,
      ...file,
      userId
    })

    if (!analysisDoc) throw boom.internal('Unexpected error when adding analysis.')

    // Set the file state as finished in the user uploads list
    await UserController.setUploadState(userId, file._id, file.name, 'finished', analysisDoc._id)
    this.log(`Added an analysis. userId=${userId}, fileName=${file.name}`)
  },

  /**
   * Find an analysis
   * @param analysisId The analysis id
   * @returns The analysis's data
   * @throws Could not find the analysis
   */
  async find(analysisId: string) {
    const analysis = await AnalysisModel.findById(analysisId)
    if (!analysis) throw boom.notFound('Analysis not found.')
    return analysis
  }
}
