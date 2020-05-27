import request from 'supertest'

import { test, before, beforeEach, afterEachAlways, afterAlways } from './_utils'

test.before(before)
test.beforeEach(beforeEach)
test.afterEach.always(afterEachAlways)
test.after.always(afterAlways)

test.serial('Get profile', async t => {
  const { app, testData, token } = t.context
  const res = await request(app).get('/profile').set('Authorization', `Bearer ${token}`)
  t.is(res.status, 200)
  t.is(res.body.data.email, testData.email)
  t.is(res.body.data.name, testData.name)
})

test.serial('Edit profile', async t => {
  const { app, testData, token } = t.context
  const res = await request(app).patch('/profile').set('Authorization', `Bearer ${token}`).send({ name: 'newName' })
  t.is(res.status, 200)
  t.is(res.body.data.email, testData.email)
  t.is(res.body.data.name, 'newName')
})

test.serial('Delete account', async t => {
  const { app, testData, token } = t.context
  const res = await request(app).delete('/profile').set('Authorization', `Bearer ${token}`)
  t.is(res.status, 200)
  t.is(res.body.data._id, testData._id)
})
