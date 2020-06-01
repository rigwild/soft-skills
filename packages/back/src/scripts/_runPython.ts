import execa from 'execa'

// const csv = (data: string) => data.split('\n')
const csv = (data: string) => data

const py = async (script: string) => (await execa('python3', [script], { timeout: 60000 })).stdout
const pyCsv = async (script: string) => csv(await py(script))

const getPitchFrequency = () => pyCsv('pitch_frequency.py')

const setup = async () => {
  const pitchFrequency = await getPitchFrequency()
  console.log(pitchFrequency)
}

setup()
