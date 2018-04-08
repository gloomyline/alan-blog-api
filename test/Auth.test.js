/*
* @Author: AlanWang
* @Date:   2018-03-29 14:33:16
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-08 14:53:34
*/
const app = require('../app')
const supertest = require('supertest')
const config = require('../config')
const expect = require('chai').expect

describe('Api server test started!', () => {
  let server = null
  let request = null
  let userId = null
  let jwt = null

  // init app
  before(done => {
    // runs before all of tests in this block
    server = app.listen(done)
    request = supertest.agent(server)
  })

  // tear down the server
  after(done => {
    // runs after all of tests in this block
    server.close(done)
  })
  
  const test_user = {
    username: config.AUTH.defaultUsername,
    password: config.AUTH.defaultPassword
  }

  it('Post /login', function (done) {
    request.post('/api/login')
      .send(test_user)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) {
          return done(err)
        }
        const data = res.body
        console.log(data)
        expect(data).to.be.a('object')
        expect(data).to.have.property('code')
        expect(data.code).to.equal(1)
        done()
        jwt = data.result.token
      })
  })
  
  it('Get /auth', function (done) {
    request.get('/api/auth')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) {
          return done(err)
        }
        const data = res.body
        expect(data).to.be.a('object')
        expect(data).to.have.property('code')
        expect(data.code).to.equal(1)
        done()
        userId = data.result._id
      })
  })

  it('Put /auth, change password', function (done) {
    const new_test_user = {
      _id: userId,
      oldPassword: config.AUTH.defaultPassword,
      newPassword: '123456'
    }

    request.put('/api/auth')
      .set('Authorization', jwt)
      .send(new_test_user)
      .expect(200)
      .then((res, err) => {
        if (err) {
          return done(err)
        }
        const data = res.body
        expect(data).to.be.a('object')
        expect(data).to.have.property('code')
        expect(data.code).to.equal(1)
        done()
      })
  })

  it('Put /auth, reset password', function (done) {
    const origin_test_user = {
      _id: userId,
      oldPassword: '123456',
      newPassword: config.AUTH.defaultPassword
    }

    request.put('/api/auth')
      .set('Authorization', jwt)
      .send(origin_test_user)
      .expect(200)
      .then((res, err) => {
        if (err) {
          return done(err)
        }
        const data = res.body
        expect(data).to.be.a('object')
        expect(data).to.have.property('code')
        expect(data.code).to.equal(1)
        done()
      })
  })
})