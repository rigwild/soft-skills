import { expose } from 'threads/worker'

import { resolve as r, basename } from 'path'
import { promises as fs } from 'fs'
import execa from 'execa'

import { UPLOADS_DIR } from '../config'
import { csv } from '../utils'
import type { AnalysisData } from '../types'

const scripts = {
  audioAnalysis: r(__dirname, 'audio_analysis.py')
}

// Repair broken blob video metadata
const ffmpegRepair = async (file: string) => {
  const tempFileName = r(UPLOADS_DIR, `broken_temp_${basename(file)}`)
  await fs.rename(file, tempFileName)
  await execa('ffmpeg', ['-i', tempFileName, file], { timeout: 300_000 })
  await fs.unlink(tempFileName)
}

const py = async (script: string, ...args: string[]) =>
  (await execa('python3', [script, ...args], { timeout: 3_600_000 })).stdout

const audioAnalysis = async (audioFilePath: string) => {
  const data = await py(scripts.audioAnalysis, audioFilePath)
  const split = data.split('\n----------\n')
  return {
    amplitudePlotFile: split[0],
    intensityPlotFile: split[1],
    pitchPlotFile: split[2],
    amplitudeDataFile: split[3],
    intensityDataFile: split[4],
    pitchDataFile: split[5]
  }
}

/**
 * Analyse a video file.
 *
 * Audio is analysed using `praat-parselmouth`.
 *
 * Generates raw data + plots as image files.
 *
 * @param videoFile Path to video file to analyse
 */
const analyse = async (videoFile: string) => {
  const data: Partial<AnalysisData> = {
    videoFile,
    audioFile: `${videoFile}.wav`
  }

  // Repair video metadatas with ffmpeg to make sure it is correct
  await ffmpegRepair(videoFile)

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

  return data as AnalysisData
}

const workerMethods = { analyse }
export type WorkerMethods = typeof workerMethods

// Expose as a Worker
expose(workerMethods)
