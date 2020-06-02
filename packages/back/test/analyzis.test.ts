import { resolve as r } from 'path'
import request from 'supertest'

import { test, before, beforeEach, afterEachAlways, afterAlways } from './_utils'

test.before(before)
test.beforeEach(beforeEach)
test.afterEach.always(afterEachAlways)
test.after.always(afterAlways)

test.serial('Fetch uploads list', async t => {
  const { app, testUserData, token } = t.context
  const res = await request(app).get('/uploads').set('Authorization', `Bearer ${token}`)

  t.is(res.status, 200)
  t.deepEqual(res.body.data, testUserData.uploads)
  t.log(res.body)
})

test.serial('Upload an invalid file', async t => {
  const { app, token } = t.context
  const res = await request(app)
    .post('/uploads')
    .set('Authorization', `Bearer ${token}`)
    .attach('content', r(__dirname, '.env.test'))

  t.is(res.status, 400)
  t.is(res.body.message, 'You need to send an audio or video file.')
})

test.serial('Upload a file for analyzis', async t => {
  const { app, testFilePath, token } = t.context
  const res = await request(app)
    .post('/uploads')
    .set('Authorization', `Bearer ${token}`)
    .attach('content', testFilePath)

  t.is(res.status, 200)
})
