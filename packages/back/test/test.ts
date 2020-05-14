import _test, { TestInterface } from 'ava'

import type { Express } from 'express'
import request from 'supertest'
import { initServer } from '../src/server'

const test = _test as TestInterface<{ app: Express }>

test.beforeEach(async t => {
  t.context.app = await initServer()
})

test('Ping server', async t => {
  const response = await request(t.context.app).get('/')

  t.is(response.status, 200)
  t.deepEqual(response.body, { message: 'Hello' })
})
