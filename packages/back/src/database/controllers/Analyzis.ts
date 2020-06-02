import boom from '@hapi/boom'

import { AnalyzisModel } from '../models/Analyzis'
import { UserController } from './User'
import type { AudioAnalyzis, UploadDB } from '../../types'

export const AnalyzisController = {
  get Model() {
    return AnalyzisModel
  },

  log(data: string | object) {
    if (process.env.NODE_ENV !== 'test') console.log(data)
  },

  /**
   * Add an analyzis
   * @param userId The user id of the user who requested the analyzis
   * @param analyzis Analyzis data
   */
  async addAnalyzis(userId: string, file: UploadDB, analyzis: AudioAnalyzis) {
    // Add the upload to the user uploads list
    const analyzisDoc = await AnalyzisModel.create({
      ...analyzis,
      ...file,
      userId
    })

    if (!analyzisDoc) throw boom.internal('Unexpected error when adding analyzis.')

    // Set the file state as finished in the user uploads list
    await UserController.setUploadState(userId, file._id, file.name, 'finished', analyzisDoc._id)
    this.log(`Added an analyzis. userId=${userId}, fileName=${file.name}`)
  },

  /**
   * Find an analyzis
   * @param analyzisId The analyzis id
   * @returns The analyzis's data
   * @throws Could not find the analyzis
   */
  async find(analyzisId: string) {
    const analyzis = await AnalyzisModel.findById(analyzisId)
    if (!analyzis) throw boom.notFound('Analyzis not found.')
    return analyzis
  }
}
