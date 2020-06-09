import { resolve as r } from 'path'

import { spawn, Worker, Pool } from 'threads'
import type { WorkerMethods } from './worker'

import { UPLOADS_DIR } from '../config'
import type { Analysis } from '../types'

/**
 * Analyse a video file extracted audio using `praat-parselmouth`.
 *
 * Generates raw data + plots as image files
 *
 * @param videoFile Path to video file to analyse
 */
export const analyseVideo = async (videoFile: string, uniqueId: string) => {
  const pool = Pool(() => spawn<WorkerMethods>(new Worker('./worker')), { concurrency: 1 })

  const data: Omit<Analysis, 'userId' | 'analysisTimestamp' | 'uploadTimestamp'> = {
    videoFile,
    audioFile: `${videoFile}.wav`,
    amplitude: [],
    intensity: [],
    pitch: [],
    amplitudePlotFile: r(UPLOADS_DIR, `${uniqueId}_amplitude.png`),
    intensityPlotFile: r(UPLOADS_DIR, `${uniqueId}_intensity.png`),
    pitchPlotFile: r(UPLOADS_DIR, `${uniqueId}_pitch.png`)
  }

  // Repair video metadatas with ffmpeg to make sure it is correct
  pool.queue(async ({ ffmpegRepair }: WorkerMethods) => ffmpegRepair(videoFile))
  await pool.completed()

  // Parallelized audio analysis
  pool.queue(async ({ getAmplitude }: WorkerMethods) => (data.amplitude = await getAmplitude(videoFile)))
  pool.queue(async ({ getIntensity }: WorkerMethods) => (data.intensity = await getIntensity(videoFile)))
  pool.queue(async ({ getPitch }: WorkerMethods) => (data.pitch = await getPitch(videoFile)))
  pool.queue(async ({ getAmplitudePlot }: WorkerMethods) => getAmplitudePlot(videoFile, data.amplitudePlotFile))
  pool.queue(async ({ getIntensityPlot }: WorkerMethods) => getIntensityPlot(videoFile, data.intensityPlotFile))
  pool.queue(async ({ getPitchPlot }: WorkerMethods) => getPitchPlot(videoFile, data.pitchPlotFile))

  await pool.completed()
  await pool.terminate()

  return data
}
