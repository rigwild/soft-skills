import _test, { TestInterface, Implementation } from 'ava'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import type { Express } from 'express'

import { app } from '../src/server'
import { UserModel } from '../src/database/models/User'
import { UserController } from '../src/database'

export type TestContext = {
  app: Express
  testData: {
    email: string
    name: string
    password: string
  }
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
  t.context.testData = {
    email: 'testuser_1234@example.com',
    name: 'test',
    password: 'secret'
  }
  t.context.token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWM1MmZkYTFlNjA2MDI0MTFiMmEwYTMiLCJlbWFpbCI6InRlc3R1c2VyXzEyMzRAZXhhbXBsZS5jb20iLCJuYW1lIjoidGVzdCIsImlhdCI6MTU4OTk4MTE0Nn0.DNE0zco-fhF6O91QSgZf5bxPMeci-uVmDXTt6JnpqmY'

  await UserController.register(t.context.testData.email, t.context.testData.password, t.context.testData.name)
}

// Clean up database after every test
export const afterEachAlways: Implementation<TestContext> = async () => {
  await UserModel.deleteMany({})
}

// Disconnect MongoDB and mongoose after all tests are done
export const afterAlways: Implementation<TestContext> = async () => {
  await mongoose.disconnect()
  mongod.stop()
}
