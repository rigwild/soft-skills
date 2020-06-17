import path from 'path'
import _test, { TestInterface, Implementation } from 'ava'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import type { Express } from 'express'

import { app } from '../src/server'
import { UserModel, AnalysisModel, StatisticsModel } from '../src/db'
import type { UserDB, AnalysisDB } from '../src/types'

export type TestContext = {
  app: Express
  testUserData: UserDB
  testFilePath: string
  testAnalysisData: AnalysisDB
  token: string
}
export const test = _test as TestInterface<TestContext>

const mongod = new MongoMemoryServer()

// Create connection to mongoose before all tests
export const before: Implementation<TestContext> = async () => {
  await mongoose.connect(await mongod.getConnectionString(), {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
}

// Create fixtures before each test
export const beforeEach: Implementation<TestContext> = async t => {
  t.context.app = app
  t.context.testUserData = {
    _id: '5ece960cfe6ce42d24ef6bea',
    email: 'testuser_1234@example.com',
    name: 'test',
    password: 'secret',
    uploads: [
      {
        _id: '5ed65e7142905c4a917be028',
        name: 'PtCLcgRs__VIDEO.mp4',
        videoFile: 'PtCLcgRs__VIDEO.mp4',
        state: 'finished',
        analysisId: '5ece960cfe6ce42d24ef6bec',
        uploadTimestamp: new Date('2020-06-03T12:15:04.853Z'),
        lastStateEditTimestamp: new Date('2020-06-03T12:15:30.853Z')
      }
    ],
    joinDate: new Date('2020-06-02T12:15:04.853Z')
  }
  t.context.testFilePath = path.resolve(__dirname, '_VIDEO.mp4')
  t.context.testAnalysisData = {
    amplitude: [[0, 0]],
    intensity: [[0, 0]],
    pitch: [[0, 0]],
    _id: '5ece960cfe6ce42d24ef6bec',
    name: 'PtCLcgRs__VIDEO.mp4',
    amplitudePlotFile: 'PtCLcgRs_amplitude.png',
    intensityPlotFile: 'PtCLcgRs_intensity.png',
    pitchPlotFile: 'PtCLcgRs_pitch.png',
    videoFile: 'PtCLcgRs__VIDEO.mp4',
    audioFile: 'PtCLcgRs__VIDEO.mp4.wav',
    userId: '5ece75285e8a084208e0b0c4',
    uploadTimestamp: new Date('2020-06-03T12:15:04.853Z'),
    analysisTimestamp: new Date('2020-06-03T12:15:30.853Z')
  }
  t.context.token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWNlOTYwY2ZlNmNlNDJkMjRlZjZiZWEiLCJlbWFpbCI6InRlc3R1c2VyXzEyMzRAZXhhbXBsZS5jb20iLCJuYW1lIjoidGVzdCIsImlhdCI6MTU5MDU5NzE1NX0.4kxSkN5z4H37X7c4SzeQnG16X_qJFe0uc_L6L-wFkgM'

  await UserModel.create({
    ...t.context.testUserData,
    password: await bcrypt.hash(t.context.testUserData.password, 1)
  })
  await AnalysisModel.create({ ...t.context.testAnalysisData })
  await StatisticsModel.create({})
}

// Clean up database after every test
export const afterEachAlways: Implementation<TestContext> = async () => {
  await UserModel.deleteMany({})
  await AnalysisModel.deleteMany({})
  await StatisticsModel.deleteMany({})
}

// Disconnect MongoDB and mongoose after all tests are done
export const afterAlways: Implementation<TestContext> = async () => {
  await mongoose.disconnect()
  mongod.stop()
}
