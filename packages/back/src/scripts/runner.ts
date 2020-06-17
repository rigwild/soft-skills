import { spawn, Worker, Pool } from 'threads'
import type { WorkerMethods } from './worker'

import type { Analysis, AnalysisData } from '../types'
import { incrementStatistic } from '../db'

// We set a 1 hour timeout for the worker so when under heavy multi-analysis load
// It will eventually finish and not crash the worker process (kills the http server)
const pool = Pool(
  () => spawn<WorkerMethods>(new Worker('./worker'), { timeout: 3_600_000 }),
  { concurrency: 1 }
)

/**
 * Analyse a video file's audio using `praat-parselmouth`.
 *
 * Generates raw data + plots as image files
 *
 * @param videoFile Path to video file to analyse
 */
export const analyseVideo = async (videoFile: string) => {
  await incrementStatistic('analysesTotalCount')

  let data: Partial<AnalysisData> = {}
  await pool.queue(async ({ analyse }: WorkerMethods) => (data = await analyse(videoFile)))

  await incrementStatistic('analysesSuccessCount')

  return data as AnalysisData
}
