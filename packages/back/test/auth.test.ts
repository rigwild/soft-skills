import request from 'supertest'
import jwt from 'jsonwebtoken'

import { JWT_SECRET } from '../src/config'

import { test, before, beforeEach, afterEachAlways, afterAlways } from './_utils'

test.before(before)
test.beforeEach(beforeEach)
test.afterEach.always(afterEachAlways)
test.after.always(afterAlways)

test.serial('Login failed (missing password)', async t => {
  const { app, testUserData } = t.context
  const res = await request(app).post('/login').send({ email: testUserData.email })
  t.is(res.status, 400)
  t.is(res.body.data.password, 'Password is missing.')
})

test.serial('Login failed (user does not exist)', async t => {
  const { app } = t.context
  const res = await request(app).post('/login').send({ email: 'test@example.com', password: 'wrong' })
  t.is(res.status, 401)
  t.is(res.body.message, 'Invalid email or password.')
})

test.serial('Login and receive a valid JWT', async t => {
  const { app, testUserData } = t.context
  const res = await request(app).post('/login').send(testUserData)
  t.is(res.status, 200)
  t.is(res.body.data.name, testUserData.name)
  t.is(res.body.data.email, testUserData.email)
  await t.notThrowsAsync(
    () =>
      new Promise((resolve, reject) =>
        jwt.verify(res.body.data.token, JWT_SECRET, (err: any, decoded: any) => (err ? reject(err) : resolve(decoded)))
      )
  )
})

test.serial('Register failed (email already registered)', async t => {
  const { app, testUserData } = t.context
  const res = await request(app).post('/register').send(testUserData)
  t.is(res.status, 409)
  t.is(res.body.message, 'Could not create the user. Email already registered.')
})

test.serial('Register failed (missing name)', async t => {
  const { app, testUserData } = t.context
  delete testUserData.name
  const res = await request(app).post('/register').send(testUserData)
  t.is(res.status, 400)
  t.is(res.body.data.name, 'Name is missing.')
})

test.serial('Register failed (invalid email address)', async t => {
  const { app, testUserData } = t.context
  const res = await request(app)
    .post('/register')
    .send({ ...testUserData, email: 'invalid' })
  t.is(res.status, 400)
  t.is(res.body.data.email, 'Email is not a valid email address.')
})

test.serial('Register', async t => {
  const { app, testUserData } = t.context
  const email = `auth_${testUserData.email}`
  const res = await request(app)
    .post('/register')
    .send({ ...testUserData, email })
  t.is(res.status, 200)
  t.is(res.body.data.email, email)
  t.is(res.body.data.name, testUserData.name)
})

test.serial('Invalid JWT is rejected', async t => {
  const { app } = t.context
  const res2 = await request(app).get('/profile').set('Authorization', `Bearer test`)
  t.is(res2.status, 401)
  t.is(res2.body.message, 'Invalid authentication token.')
})

test.serial('Valid JWT', async t => {
  const { app, token } = t.context
  const res = await request(app).get('/profile').set('Authorization', `Bearer ${token}`)
  t.is(res.status, 200)
})
