import { resolve as r } from 'path'
import { promises as fs } from 'fs'
import request from 'supertest'

import { test, before, beforeEach, afterEachAlways, afterAlways } from './_utils'
import { UserModel, findUser, AnalysisModel, getStatistics } from '../src/db'
import type { UserDB } from '../src/types'
import { UPLOADS_DIR } from '../src/config'

test.before(before)
test.beforeEach(beforeEach)
test.afterEach.always(afterEachAlways)
test.after.always(afterAlways)

test.serial('Fetch uploads list', async t => {
  const { app, testUserData, token } = t.context
  const res = await request(app).get('/uploads').set('Authorization', `Bearer ${token}`)

  t.is(res.status, 200)
  t.is(res.body.data[0].videoFile, testUserData.uploads[0].videoFile)
  t.is(res.body.data[0].state, testUserData.uploads[0].state)
  t.is(res.body.data[0].analysisId, testUserData.uploads[0].analysisId)
})

test.serial('Get an analysis raw data', async t => {
  const { app, testAnalysisData, token } = t.context
  const res = await request(app).get(`/analysis/${testAnalysisData._id}`).set('Authorization', `Bearer ${token}`)

  t.is(res.status, 200)
  t.is(res.body.data.videoFile, testAnalysisData.videoFile)
  t.is(res.body.data.audioFile, testAnalysisData.audioFile)
  t.is(res.body.data.amplitudePlotFile, testAnalysisData.amplitudePlotFile)
  t.is(res.body.data.intensityPlotFile, testAnalysisData.intensityPlotFile)
  t.is(res.body.data.pitchPlotFile, testAnalysisData.pitchPlotFile)
  t.deepEqual(res.body.data.amplitude, testAnalysisData.amplitude)
  t.deepEqual(res.body.data.intensity, testAnalysisData.intensity)
  t.deepEqual(res.body.data.pitch, testAnalysisData.pitch)
})

test.serial('Delete an analysis', async t => {
  const { app, testUserData, testAnalysisData, token } = t.context
  const res = await request(app).delete(`/analysis/${testAnalysisData._id}`).set('Authorization', `Bearer ${token}`)

  t.is(res.status, 200)
  // Check in database if analysis was really deleted
  t.falsy((await UserModel.findById(testUserData._id))?.uploads.find(x => x.analysisId))
  t.falsy(await AnalysisModel.findById(testAnalysisData._id))
})

test.serial('Edit an analysis', async t => {
  const { app, testUserData, testAnalysisData, token } = t.context
  const newName = 'example'
  const res = await request(app)
    .patch(`/uploads/${testUserData.uploads[0]._id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ name: newName })

  t.is(res.status, 200)
  // Check in database if analysis was really edited
  t.is((await UserModel.findById(testUserData._id))?.uploads[0].name, newName)
  t.is((await AnalysisModel.findById(testAnalysisData._id))?.name, newName)
})

test.serial('Upload an invalid file', async t => {
  const { app, token } = t.context
  const res = await request(app)
    .post('/uploads')
    .set('Authorization', `Bearer ${token}`)
    .attach('content', r(__dirname, '.env.test'))

  t.is(res.status, 400)
  t.is(res.body.message, 'You need to send a video file.')
})

test.serial('Retry a failed analysis', async t => {
  const { app, testUserData, token } = t.context

  // Copy the `_VIDEO.mp4` test file to the `test/uploads` directory
  await fs.copyFile(r(UPLOADS_DIR, '..', '_VIDEO.mp4'), r(UPLOADS_DIR, 'retryTest-_VIDEO.mp4'))

  // Mark an upload's analysis as failed
  await UserModel.findOneAndUpdate(
    { _id: testUserData._id, 'uploads._id': testUserData.uploads[0]._id },
    {
      'uploads.$.videoFile': 'retryTest-_VIDEO.mp4',
      'uploads.$.state': 'error',
      'uploads.$.analysisId': null,
      'uploads.$.errorMessage': 'python error'
    }
  )

  const res = await request(app)
    .post(`/uploads/${testUserData.uploads[0]._id}/retry`)
    .set('Authorization', `Bearer ${token}`)

  t.is(res.status, 200)

  // Check analyses count statistic was incremented
  const statistics1 = await getStatistics()
  t.is(statistics1.analysesTotalCount, 1)
  t.is(statistics1.analysesSuccessCount, 0)

  t.is(res.body.data.state, 'pending')
})

test.serial('Upload a video file for analysis', async t => {
  const { app, testUserData, testAnalysisData, testFilePath, token } = t.context

  // Delete pre-injected upload test data
  await UserModel.findOneAndUpdate({ _id: testUserData._id }, { uploads: [] })

  const res = await request(app)
    .post('/uploads')
    .set('Authorization', `Bearer ${token}`)
    .attach('content', testFilePath)

  t.is(res.status, 200)

  // Check analyses count statistic was incremented
  const statistics1 = await getStatistics()
  t.is(statistics1.analysesTotalCount, 1)
  t.is(statistics1.analysesSuccessCount, 0)

  let upload = ((await findUser(testUserData._id)).toObject({ versionKey: false }) as UserDB).uploads[0]

  t.true(upload.videoFile.endsWith(testUserData.uploads[0].videoFile.split('_')[2]))
  t.is(upload.state, 'pending')

  // Continuously check the analysis status until it is finished (test will timeout and fail if never finished)
  while (true) {
    upload = ((await findUser(testUserData._id)).toObject({ versionKey: false }) as UserDB).uploads[0]
    if (upload.state === 'finished') {
      t.true(!!upload.analysisId)
      break
    }
    // Wait 250 ms before checking again
    await new Promise(res => setTimeout(res, 250))
  }

  // Check success analysis statistic was incremented
  const statistics2 = await getStatistics()
  t.is(statistics2.analysesTotalCount, 1)
  t.is(statistics2.analysesSuccessCount, 1)

  // Check analysis data is available
  const res2 = await request(app).get(`/analysis/${upload.analysisId}`).set('Authorization', `Bearer ${token}`)
  t.is(res2.status, 200)
  t.true(res2.body.data.videoFile.endsWith(testAnalysisData.videoFile.split('_')[2]))
  t.true(res2.body.data.audioFile.endsWith(testAnalysisData.audioFile.split('_')[2]))

  // Check images are accessible
  const getFile = (type: string) =>
    request(app).get(`/analysis/${upload.analysisId}/${type}`).set('Authorization', `Bearer ${token}`)
  const checkImage = (_res: request.Response) => {
    t.is(_res.status, 200)
    t.is(_res.header['content-type'], 'image/png')
  }

  checkImage(await getFile('amplitudePlotFile'))
  checkImage(await getFile('intensityPlotFile'))
  checkImage(await getFile('pitchPlotFile'))

  const videoFile = await getFile('videoFile')
  t.is(videoFile.status, 200)
  t.is(videoFile.header['content-type'], 'video/mp4')

  const audioFile = await getFile('audioFile')
  t.is(audioFile.status, 200)
  t.is(audioFile.header['content-type'], 'audio/wav')
})
