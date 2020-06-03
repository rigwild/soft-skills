import { expose } from 'threads/worker'

import { resolve as r, basename } from 'path'
import { promises as fs } from 'fs'
import execa from 'execa'

import { UPLOADS_DIR } from '../config'
import type { AudioAnalyzisData } from '../types'

const scripts = {
  audioAnalyzis: r(__dirname, 'audio_analyzis.py')
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

const audioAnalyzis = async (file: string, data: AudioAnalyzisData) =>
  pyCsv(scripts.audioAnalyzis, file, 'print_raw_data', data)
const audioAnalyzisPlot = (file: string, outputFile: string, data: AudioAnalyzisData) =>
  py(scripts.audioAnalyzis, file, 'generate_plot_file', data, outputFile)

const getAmplitude = (file: string) => audioAnalyzis(file, 'amplitude')
const getIntensity = (file: string) => audioAnalyzis(file, 'intensity')
const getPitch = (file: string) => audioAnalyzis(file, 'pitch')

const getAmplitudePlot = (file: string, outputFile: string) => audioAnalyzisPlot(file, outputFile, 'amplitude')
const getIntensityPlot = (file: string, outputFile: string) => audioAnalyzisPlot(file, outputFile, 'intensity')
const getPitchPlot = (file: string, outputFile: string) => audioAnalyzisPlot(file, outputFile, 'pitch')

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
