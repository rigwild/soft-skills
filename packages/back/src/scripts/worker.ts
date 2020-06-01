import { expose } from 'threads/worker'

import { resolve as r } from 'path'
import execa from 'execa'
import { nanoid } from 'nanoid'

const scripts = {
  audioAnalyzis: r(__dirname, 'audio_analyzis.py')
}

const csv = (data: string) => data.split('\n').map(x => x.split(' ').map(x => parseFloat(x)))

const py = async (script: string, ...args: string[]) =>
  (await execa('python3', [script, ...args], { timeout: 120_000 })).stdout
const pyCsv = async (script: string, ...args: string[]) => csv(await py(script, ...args))

const audioAnalyzis = async (audioFile: string, data: 'amplitude' | 'intensity' | 'pitch') =>
  pyCsv(scripts.audioAnalyzis, audioFile, 'print_raw_data', data)

const audioAnalyzisPlot = (audioFile: string, outputFile: string, data: 'amplitude' | 'intensity' | 'pitch') =>
  py(scripts.audioAnalyzis, audioFile, 'generate_plot_file', data, outputFile)

const getAmplitude = (audioFile: string) => audioAnalyzis(audioFile, 'amplitude')
const getIntensity = (audioFile: string) => audioAnalyzis(audioFile, 'intensity')
const getPitch = (audioFile: string) => audioAnalyzis(audioFile, 'pitch')

const getAmplitudePlot = (audioFile: string, outputFile: string) =>
  audioAnalyzisPlot(audioFile, outputFile, 'amplitude')
const getIntensityPlot = (audioFile: string, outputFile: string) =>
  audioAnalyzisPlot(audioFile, outputFile, 'intensity')
const getPitchPlot = (audioFile: string, outputFile: string) => audioAnalyzisPlot(audioFile, outputFile, 'pitch')

const workerMethods = { getAmplitude, getIntensity, getPitch, getAmplitudePlot, getIntensityPlot, getPitchPlot }
export type WorkerMethods = typeof workerMethods
export type AudioAnalyzisTypes = 'amplitude' | 'intensity' | 'pitch'

// Expose as a Worker
expose(workerMethods)
