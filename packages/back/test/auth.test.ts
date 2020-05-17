import _test, { TestInterface } from 'ava'
import request from 'supertest'

import type { Express } from 'express'
import { app } from '../src/server'
import { UserController, connectDb } from '../src/database'

const test = _test as TestInterface<{
  app: Express
  testData: { username: string; name: string; password: string }
}>

const _testUsername = '__TEST_AUTH_USERNAME'

test.before(async () => {
  await connectDb()
  // Clean database before tests
  await UserController.Model.deleteMany({ username: _testUsername })
})

test.beforeEach(async t => {
  t.context.app = app
  t.context.testData = {
    username: _testUsername,
    name: 'test',
    password: 'secret'
  }
})

test.after.always(async () => {
  // Clean database after tests
  await UserController.Model.deleteMany({ username: _testUsername })
})

test.serial('Register success', async t => {
  const { app, testData } = t.context
  const res = await request(app).post('/register').send(testData)
  t.is(res.status, 200)
  t.is(res.body.data.name, testData.name)
  t.is(res.body.data.username, testData.username)
})

test.serial('Register failed (username already used)', async t => {
  const { app, testData } = t.context
  const res = await request(app).post('/register').send(testData)
  t.is(res.status, 500)
  t.is(res.body.message, 'Could not create the user. User already exists.')
})

test.serial('Register failed (missing name)', async t => {
  const { app, testData } = t.context
  delete testData.name
  const res = await request(app).post('/register').send(testData)
  t.is(res.status, 400)
  t.is(res.body.data.name, 'Name is missing.')
})

test.serial('Login success', async t => {
  const { app, testData } = t.context
  const res = await request(app).post('/login').send(testData)
  t.is(res.status, 200)
  t.is(res.body.data.name, testData.name)
  t.is(res.body.data.username, testData.username)
})

test.serial('Login failed (missing password)', async t => {
  const { app, testData } = t.context
  const res = await request(app).post('/login').send({ username: testData.username })
  t.is(res.status, 400)
  t.is(res.body.data.password, 'Password is missing.')
})

test.serial('Login failed (user do not exists)', async t => {
  const { app } = t.context
  const res = await request(app).post('/login').send({ username: 'test', password: 'wrong' })
  t.is(res.status, 401)
  t.is(res.body.message, 'Invalid email or password.')
})
