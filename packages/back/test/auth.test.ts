import _test, { TestInterface } from 'ava'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import type { Express } from 'express'

import { app } from '../src/server'
import { UserController, connectDb, closeDb } from '../src/database'
import { JWT_SECRET } from '../src/config'

const test = _test as TestInterface<{
  app: Express
  testData: {
    username: string
    name: string
    password: string
  }
  token: string
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
  t.context.token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWM1MDM1MTliMDBkNTBlNzk0ZDU4NzQiLCJ1c2VybmFtZSI6Il9fVEVTVF9BVVRIX1VTRVJOQU1FIiwibmFtZSI6InRlc3QiLCJpYXQiOjE1ODk5Njk3NDYsImV4cCI6MTU5MjU2MTc0Nn0.nfcspG9uk6xvHAfVkAMgbbReB7yWvPdvY-GJjdl772A'
})

test.after.always(async () => {
  // Clean database after tests
  await UserController.Model.deleteMany({ username: _testUsername })
  await closeDb()
})

test('Register failed (username already taken)', async t => {
  const { app, testData } = t.context
  const res = await request(app).post('/register').send(testData)
  t.is(res.status, 409)
  t.is(res.body.message, 'Could not create the user. User already exists.')
})

test('Register failed (missing name)', async t => {
  const { app, testData } = t.context
  delete testData.name
  const res = await request(app).post('/register').send(testData)
  t.is(res.status, 400)
  t.is(res.body.data.name, 'Name is missing.')
})

test('Login failed (missing password)', async t => {
  const { app, testData } = t.context
  const res = await request(app).post('/login').send({ username: testData.username })
  t.is(res.status, 400)
  t.is(res.body.data.password, 'Password is missing.')
})

test('Login failed (user does not exist)', async t => {
  const { app } = t.context
  const res = await request(app).post('/login').send({ username: 'test', password: 'wrong' })
  t.is(res.status, 401)
  t.is(res.body.message, 'Invalid email or password.')
})

test('Invalid JWT is rejected', async t => {
  const { app } = t.context
  // FIXME: Replace with a `/profile` route when it exists
  const res2 = await request(app).get('/authed/user').set('Authorization', `Bearer test`)
  t.is(res2.status, 401)
  t.is(res2.body.message, 'Invalid authentication token.')
})

test('Access user profile data', async t => {
  const { app, testData, token } = t.context

  // FIXME: Replace with a `/profile` route when it exists
  const res = await request(app).get('/authed/user').set('Authorization', `Bearer ${token}`)
  t.is(res.status, 200)
  t.is(res.body.userDoc.username, testData.username)
  t.is(res.body.userDoc.name, testData.name)
})

test.serial('Register', async t => {
  const { app, testData } = t.context
  const res = await request(app).post('/register').send(testData)
  t.is(res.status, 200)
  t.is(res.body.data.name, testData.name)
  t.is(res.body.data.username, testData.username)
})

test.serial('Login and receive a valid JWT', async t => {
  const { app, testData } = t.context
  const res = await request(app).post('/login').send(testData)
  t.is(res.status, 200)
  t.is(res.body.data.name, testData.name)
  t.is(res.body.data.username, testData.username)
  await t.notThrowsAsync(
    () =>
      new Promise((resolve, reject) =>
        jwt.verify(res.body.data.token, JWT_SECRET, (err: any, decoded: any) => (err ? reject(err) : resolve(decoded)))
      )
  )
})
