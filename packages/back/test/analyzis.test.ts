import { resolve as r } from 'path'
import request from 'supertest'

import { test, before, beforeEach, afterEachAlways, afterAlways } from './_utils'
import { UserController } from '../src/database'
import { User } from '../src/types'

test.before(before)
test.beforeEach(beforeEach)
test.afterEach.always(afterEachAlways)
test.after.always(afterAlways)

test.serial('Fetch uploads list', async t => {
  const { app, testUserData, token } = t.context
  const res = await request(app).get('/uploads').set('Authorization', `Bearer ${token}`)

  t.is(res.status, 200)
  t.deepEqual(res.body.data, testUserData.uploads)
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
  const { app, testUserData, testFilePath, token } = t.context

  // Delete pre-injected upload test data
  await UserController.Model.findOneAndUpdate({ _id: testUserData._id }, { uploads: [] })

  const res = await request(app)
    .post('/uploads')
    .set('Authorization', `Bearer ${token}`)
    .attach('content', testFilePath)

  t.is(res.status, 200)

  const upload = ((await UserController.find(testUserData._id)).toObject({ versionKey: false }) as User).uploads[0]

  t.true(upload.name.endsWith(testUserData.uploads[0].name.split('_')[2]))
  t.is(upload.mimeType, testUserData.uploads[0].mimeType)
  t.is(upload.size, testUserData.uploads[0].size)
  t.is(upload.state, 'pending')
})
