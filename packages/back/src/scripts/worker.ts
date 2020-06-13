import { expose } from 'threads/worker'

import { resolve as r, basename } from 'path'
import { promises as fs } from 'fs'
import execa from 'execa'

import { UPLOADS_DIR } from '../config'

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

const workerMethods = { ffmpegRepair, audioAnalysis }
export type WorkerMethods = typeof workerMethods

// Expose as a Worker
expose(workerMethods)
