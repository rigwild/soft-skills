import mongoose, { Schema } from 'mongoose'

import { log } from '../utils'
import type { Statistics } from '../types'

export type StatisticsDocument = Statistics & mongoose.Document

export const StatisticsSchema = new Schema(
  {
    analysesTotalCount: { type: Number, required: true, default: 0 },
    analysesSuccessCount: { type: Number, required: true, default: 0 },
    usersCount: { type: Number, required: true, default: 0 }
  },
  { versionKey: false }
)

export const StatisticsModel = mongoose.model<StatisticsDocument>('Statistics', StatisticsSchema)

/** Create the statistics document */
export const initStatistics = async () => {
  if ((await StatisticsModel.countDocuments({})) === 0) {
    await StatisticsModel.create({})
    log('Initialized the statistics.')
  }
}

/**
 * Increment a statistic
 * @param statisticName The statistic to increment
 * @param inc Increment amount
 */
export const incrementStatistic = async (statisticName: keyof Statistics, inc = 1) => {
  await StatisticsModel.updateOne({}, { $inc: { [statisticName]: inc } })
  log(`Updated statistic: ${statisticName} ${inc > 0 ? '+' : ''}${inc}`)
}

export const getStatistics = async () => (await StatisticsModel.findOne({}, { _id: 0 })) as Statistics
