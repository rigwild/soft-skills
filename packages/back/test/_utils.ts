import _test, { TestInterface, Implementation } from 'ava'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import type { Express } from 'express'

import { app } from '../src/server'
import { UserModel } from '../src/database/models/User'

export type TestContext = {
  app: Express
  testData: {
    _id: string
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
    _id: '5ece960cfe6ce42d24ef6bea',
    email: 'testuser_1234@example.com',
    name: 'test',
    password: 'secret'
  }
  t.context.token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWNlOTYwY2ZlNmNlNDJkMjRlZjZiZWEiLCJlbWFpbCI6InRlc3R1c2VyXzEyMzRAZXhhbXBsZS5jb20iLCJuYW1lIjoidGVzdCIsImlhdCI6MTU5MDU5NzE1NX0.4kxSkN5z4H37X7c4SzeQnG16X_qJFe0uc_L6L-wFkgM'

  await UserModel.create({
    ...t.context.testData,
    password: await bcrypt.hash(t.context.testData.password, 1)
  })
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
