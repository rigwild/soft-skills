import test from 'ava'
import request from 'supertest';
import app from '../src/server';

test('Ping server', async t => {
  let expectedBody = {
    message: 'Hello'
  }
  const response = await request(app).get('/')
  t.is(response.status, 200)
  t.is(response.body.message, expectedBody.message)
})
