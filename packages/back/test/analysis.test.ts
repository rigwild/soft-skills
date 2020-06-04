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

test.serial('Get an analysis raw data', async t => {
  const { app, testAnalysisData, token } = t.context
  const res = await request(app).get(`/analysis/${testAnalysisData._id}`).set('Authorization', `Bearer ${token}`)

  t.is(res.status, 200)
  t.is(res.body.data.amplitudePlotFile, testAnalysisData.amplitudePlotFile)
  t.is(res.body.data.intensityPlotFile, testAnalysisData.intensityPlotFile)
  t.is(res.body.data.pitchPlotFile, testAnalysisData.pitchPlotFile)
  t.is(res.body.data.name, testAnalysisData.name)
  t.is(res.body.data.size, testAnalysisData.size)
  t.deepEqual(res.body.data.amplitude, testAnalysisData.amplitude)
  t.deepEqual(res.body.data.intensity, testAnalysisData.intensity)
  t.deepEqual(res.body.data.pitch, testAnalysisData.pitch)
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

test.serial('Upload an audio file for analysis', async t => {
  const { app, testUserData, testAnalysisData, testFilePath, token } = t.context

  // Delete pre-injected upload test data
  await UserController.Model.findOneAndUpdate({ _id: testUserData._id }, { uploads: [] })

  const res = await request(app)
    .post('/uploads')
    .set('Authorization', `Bearer ${token}`)
    .attach('content', testFilePath)

  t.is(res.status, 200)

  let upload = ((await UserController.find(testUserData._id)).toObject({ versionKey: false }) as User).uploads[0]

  t.true(upload.name.endsWith(testUserData.uploads[0].name.split('_')[2]))
  t.is(upload.mimeType, testUserData.uploads[0].mimeType)
  t.is(upload.size, testUserData.uploads[0].size)
  t.is(upload.state, 'pending')

  // Continuously check the analysis status until it is finished (test will timeout and fail if never finished)
  while (true) {
    upload = ((await UserController.find(testUserData._id)).toObject({ versionKey: false }) as User).uploads[0]
    if (upload.state === 'finished') {
      t.true(!!upload.analysisId)
      break
    }
    // Wait 2 seconds before checking again
    await new Promise(res => setTimeout(res, 2000))
  }

  // Check analysis data is available
  const res2 = await request(app).get(`/analysis/${upload.analysisId}`).set('Authorization', `Bearer ${token}`)
  t.is(res2.status, 200)
  t.true(res2.body.data.name.endsWith(testUserData.uploads[0].name.split('_')[2]))
  t.is(res2.body.data.mimeType, testUserData.uploads[0].mimeType)
  t.is(res2.body.data.size, testUserData.uploads[0].size)

  // Check images are accessible
  const getFile = (type: string) =>
    request(app).get(`/analysis/${upload.analysisId}/${type}`).set('Authorization', `Bearer ${token}`)
  const checkImage = (_res: request.Response) => {
    t.is(_res.status, 200)
    t.is(_res.header['content-type'], 'image/png')
  }

  checkImage(await getFile('amplitude'))
  checkImage(await getFile('intensity'))
  checkImage(await getFile('pitch'))
  const file = await getFile('file')
  t.is(file.status, 200)
  t.is(file.header['content-type'], testAnalysisData.mimeType)
})
