/*
* @Author: AlanWang
* @Date:   2018-04-04 15:21:25
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-08 14:15:25
*/

const app = require('../app')
const config = require('../config')
const supertest = require('supertest')
const expect = require('chai').expect

describe('init::app', () => {
  let server = null
  let request = null

  before(done => {
    server = app.listen(done)
    request = supertest.agent(server)
  })

  after(done => {
    server.close(done)
  })

  describe('Option', () => {
    let jwt = null
    let optionId = null

    const test_user = {
      username: config.AUTH.defaultUsername,
      password: config.AUTH.defaultPassword
    }

    it('Post /login', done => {
      request.post('/api/login')
        .send(test_user)
        .expect('Content-type', /json/)
        .expect(200)
        .then((res, err) => {
          if (err) return done(err)
          const data = res.body
          expect(data).to.be.a('object')
          expect(data).to.have.property('code')
          expect(data.code).to.equal(1)
          done()
          jwt = data.result.token
        })
    })


    it('Get /option', done => {
      request.get('/api/option')
        .expect('Content-type', /json/)
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
          optionId = data.result._id
        })
    })

    it ('Put /option', done => {
      const opts = {
        _id: optionId,
        meta: { likes: 100 },
        title: 'test title',
        sub_title: 'test subtitle',
        url: 'test url'
      }
      request.put('/api/option')
        .set('Authorization', jwt)
        .send(opts)
        .expect('Content-type', /json/)
        .expect(200)
        .then((res, err) => {
          if (err) {
            return done(err)
          }
          const data = res.body
          expect(data).to.be.a('object')
          expect(data).to.have.property('code')
          expect(data.code).to.equal(1)
          expect(data.result).to.equal(optionId)
          done()
        })
    })
  })
})