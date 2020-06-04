import { expose } from 'threads/worker'

import { resolve as r, basename } from 'path'
import { promises as fs } from 'fs'
import execa from 'execa'

import { UPLOADS_DIR } from '../config'
import type { AudioAnalysisData } from '../types'

const scripts = {
  audioAnalysis: r(__dirname, 'audio_analysis.py')
}

// Repair broken blob video metadata
const ffmpegRepair = async (file: string) => {
  const tempFileName = r(UPLOADS_DIR, `broken_temp_${basename(file)}`)
  await fs.rename(file, tempFileName)
  await execa('ffmpeg', ['-i', tempFileName, file], { timeout: 120_000 })
  await fs.unlink(tempFileName)
}

const csv = (data: string) => data.split('\n').map(x => x.split(' ').map(x => parseFloat(x)))

const py = async (script: string, ...args: string[]) =>
  (await execa('python3', [script, ...args], { timeout: 120_000 })).stdout
const pyCsv = async (script: string, ...args: string[]) => csv(await py(script, ...args))

const audioAnalysis = async (file: string, data: AudioAnalysisData) =>
  pyCsv(scripts.audioAnalysis, file, 'print_raw_data', data)
const audioAnalysisPlot = (file: string, outputFile: string, data: AudioAnalysisData) =>
  py(scripts.audioAnalysis, file, 'generate_plot_file', data, outputFile)

const getAmplitude = (file: string) => audioAnalysis(file, 'amplitude')
const getIntensity = (file: string) => audioAnalysis(file, 'intensity')
const getPitch = (file: string) => audioAnalysis(file, 'pitch')

const getAmplitudePlot = (file: string, outputFile: string) => audioAnalysisPlot(file, outputFile, 'amplitude')
const getIntensityPlot = (file: string, outputFile: string) => audioAnalysisPlot(file, outputFile, 'intensity')
const getPitchPlot = (file: string, outputFile: string) => audioAnalysisPlot(file, outputFile, 'pitch')

const workerMethods = {
  ffmpegRepair,
  getAmplitude,
  getIntensity,
  getPitch,
  getAmplitudePlot,
  getIntensityPlot,
  getPitchPlot
}
export type WorkerMethods = typeof workerMethods

// Expose as a Worker
expose(workerMethods)
