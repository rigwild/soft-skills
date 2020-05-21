import execa from 'execa'

const setup = async () => {
  const { stdout } = await execa('python3', ['a.py'])
  console.log(stdout)
}

setup()
