import { resolve as r } from 'path'
import { nanoid } from 'nanoid'

import { spawn, Worker, Pool } from 'threads'
import type { WorkerMethods } from './worker'

import { UPLOADS_DIR } from '../config'
import type { AudioAnalyzis } from '../types'

/**
 * Analyze an audio file using `praat-parselmouth`.
 *
 * Generates raw data + plots as image files
 *
 * @param audioFile Path to audio file to analyze
 */
export const analyzeAudio = async (audioFile: string) => {
  const pool = Pool(() => spawn<WorkerMethods>(new Worker('./worker')), { concurrency: 1 })

  const uniqueId = nanoid()

  const data: AudioAnalyzis = {
    amplitude: [],
    intensity: [],
    pitch: [],
    amplitudePlotFilePath: r(UPLOADS_DIR, `${uniqueId}_amplitude.png`),
    intensityPlotFilePath: r(UPLOADS_DIR, `${uniqueId}_intensity.png`),
    pitchPlotFilePath: r(UPLOADS_DIR, `${uniqueId}_pitch.png`)
  }

  pool.queue(async ({ getAmplitude }: WorkerMethods) => (data.amplitude = await getAmplitude(audioFile)))
  pool.queue(async ({ getIntensity }: WorkerMethods) => (data.intensity = await getIntensity(audioFile)))
  pool.queue(async ({ getPitch }: WorkerMethods) => (data.pitch = await getPitch(audioFile)))
  pool.queue(async ({ getAmplitudePlot }: WorkerMethods) => getAmplitudePlot(audioFile, data.amplitudePlotFilePath))
  pool.queue(async ({ getIntensityPlot }: WorkerMethods) => getIntensityPlot(audioFile, data.intensityPlotFilePath))
  pool.queue(async ({ getPitchPlot }: WorkerMethods) => getPitchPlot(audioFile, data.pitchPlotFilePath))

  await pool.completed()
  await pool.terminate()

  return data
}

const setup = async () => {
  const audioFile = r(__dirname, '../../test/_NW001.wav')
  console.log('Starting worker')
  console.time('aaa')
  const analyzis = await analyzeAudio(audioFile)
  console.timeEnd('aaa')
  console.log(analyzis)
}

setup()
