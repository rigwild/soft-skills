import { promises as fs } from 'fs'
import { spawn, Worker, Pool } from 'threads'
import type { WorkerMethods } from './worker'

import { csv } from '../utils'
import type { Analysis } from '../types'

/**
 * Analyse a video file extracted audio using `praat-parselmouth`.
 *
 * Generates raw data + plots as image files
 *
 * @param videoFile Path to video file to analyse
 */
export const analyseVideo = async (videoFile: string) => {
  // We set a 1 hour timeout for the worker so when under heavy multi-analysis load
  // It will eventually finish and not crash the worker process (kills the http server)
  const pool = Pool(
    () => spawn<WorkerMethods>(new Worker('./worker'), { timeout: 3_600_000 }),
    { concurrency: 1 }
  )

  const data: Partial<Omit<Analysis, 'userId' | 'analysisTimestamp' | 'uploadTimestamp'>> = {
    videoFile,
    audioFile: `${videoFile}.wav`
  }

  // Repair video metadatas with ffmpeg to make sure it is correct
  pool.queue(async ({ ffmpegRepair }: WorkerMethods) => ffmpegRepair(videoFile))
  await pool.completed()

  pool.queue(async ({ audioAnalysis }: WorkerMethods) => {
    const res = await audioAnalysis(videoFile)

    // Read CSV data files
    const [amplitude, intensity, pitch] = await Promise.all([
      fs.readFile(res.amplitudeDataFile, { encoding: 'utf-8' }),
      fs.readFile(res.intensityDataFile, { encoding: 'utf-8' }),
      fs.readFile(res.pitchDataFile, { encoding: 'utf-8' })
    ])

    data.amplitudePlotFile = res.amplitudePlotFile
    data.intensityPlotFile = res.intensityPlotFile
    data.pitchPlotFile = res.pitchPlotFile
    data.amplitude = csv(amplitude)
    data.intensity = csv(intensity)
    data.pitch = csv(pitch)

    // Remove CSV data files
    // await Promise.all([
    //   fs.unlink(res.amplitudeDataFile),
    //   fs.unlink(res.intensityDataFile),
    //   fs.unlink(res.pitchDataFile)
    // ])
  })

  await pool.completed()
  await pool.terminate()

  return data as Omit<Analysis, 'userId' | 'analysisTimestamp' | 'uploadTimestamp'>
}
