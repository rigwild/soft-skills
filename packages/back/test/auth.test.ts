import _test, { TestInterface } from 'ava'
import mongoose from 'mongoose'
import request from 'supertest'

import type { Express } from 'express'
import { initServer, app } from '../src/server'

const test = _test as TestInterface<{ app: Express }>

test.beforeEach(async t => {
  await initServer()
  t.context.app = app
})

test.after(async t => {
  mongoose.connection.collections['users'].drop()
})

test.serial('Register succes', async t => {
    const {app} = t.context
    const res = await request(app)
          .post('/register')
          .send({
            username: 'test',
            name: 'test',
            password: 'secret'
          })
    t.is(res.status, 200)
    t.is(res.body.data.name, 'test')
    t.is(res.body.data.username, 'test')
  })
  
  test.serial('Register failed (username already used)', async t => {
    const {app} = t.context
    const res = await request(app)
          .post('/register')
          .send({
            username: 'test',
            name: 'test',
            password: 'secret'
          })
    t.is(res.status, 500)
    t.is(res.body.message, 'Could not create the user. User already exists.')
  })
  
  test.serial('Register failed (missing name)', async t => {
    const {app} = t.context
    const res = await request(app)
          .post('/register')
          .send({
            username: 'test',
            password: 'secret'
          })
    t.is(res.status, 400)
    t.is(res.body.data.name, 'Name is missing.')
  })
  
  test.serial('Login succes', async t => {
    const {app} = t.context
    const res = await request(app)
          .post('/login')
          .send({
            username: 'test',
            password: 'secret'
          })
    t.is(res.status, 200)
    t.is(res.body.data.name, 'test')
    t.is(res.body.data.username, 'test')
  })
  
  test.serial('Login failed (missing password)', async t => {
    const {app} = t.context
    const res = await request(app)
          .post('/login')
          .send({
            username: 'test'
          })
    t.is(res.status, 400)
    t.is(res.body.data.password, 'Password is missing.')
  })
  
  test.serial('Login failed (user do not exists)', async t => {
    const {app} = t.context
    const res = await request(app)
          .post('/login')
          .send({
            username: 'test',
            password: 'wrong'
          })
    t.is(res.status, 401)
    t.is(res.body.message, 'Invalid email or password.')
  })