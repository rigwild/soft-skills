import test from 'ava'
import hello from '../'

test('main', t => {
  t.is(hello('rigwild'), 'hellow rigwild')
})
