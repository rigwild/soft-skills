import { resolve as r } from 'path'

import { spawn, Worker, Pool } from 'threads'
import type { WorkerMethods } from './worker'

import { UPLOADS_DIR } from '../config'
import type { AudioAnalysis } from '../types'

/**
 * Analyse an audio file using `praat-parselmouth`.
 *
 * Generates raw data + plots as image files
 *
 * @param audioFile Path to audio file to analyse
 */
export const analyseAudio = async (audioFile: string, uniqueId: string) => {
  const pool = Pool(() => spawn<WorkerMethods>(new Worker('./worker')), { concurrency: 1 })

  const data: AudioAnalysis = {
    amplitude: [],
    intensity: [],
    pitch: [],
    amplitudePlotFile: r(UPLOADS_DIR, `${uniqueId}_amplitude.png`),
    intensityPlotFile: r(UPLOADS_DIR, `${uniqueId}_intensity.png`),
    pitchPlotFile: r(UPLOADS_DIR, `${uniqueId}_pitch.png`)
  }

  // Repair video metadatas with ffmpeg to make sure it is correct
  pool.queue(async ({ ffmpegRepair }: WorkerMethods) => ffmpegRepair(audioFile))
  await pool.completed()

  // Parallelized audio analysis
  pool.queue(async ({ getIntensity }: WorkerMethods) => (data.intensity = await getIntensity(audioFile)))
  pool.queue(async ({ getPitch }: WorkerMethods) => (data.pitch = await getPitch(audioFile)))
  pool.queue(async ({ getAmplitudePlot }: WorkerMethods) => getAmplitudePlot(audioFile, data.amplitudePlotFile))
  pool.queue(async ({ getIntensityPlot }: WorkerMethods) => getIntensityPlot(audioFile, data.intensityPlotFile))
  pool.queue(async ({ getPitchPlot }: WorkerMethods) => getPitchPlot(audioFile, data.pitchPlotFile))

  await pool.completed()
  await pool.terminate()

  return data
}
