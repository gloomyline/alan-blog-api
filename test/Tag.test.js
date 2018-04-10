/*
* @Author: AlanWang
* @Date:   2018-04-09 16:28:02
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-10 15:10:01
*/
const app = require('../app')
const supertest = require('supertest')
const expect = require('chai').expect
const Tag = require('../model/tag.model')
const config = require('../config')
const { log } = require('../utils/handle')

describe('init::app for testing Tag', () => {
  let server = null
  let request = null
  let jwt = null
  let tagId = null
  let tagIds = []

  const test_user = {
    username: config.AUTH.defaultUsername,
    password: config.AUTH.defaultPassword
  }

  before(done => {
    server = app.listen(done)
    request = supertest.agent(server)
  })

  after(done => {
    Tag.remove()
      .then(tag => {
        log('Remove test tag document completely :)')
        server.close(done)
      })
      .catch(err => done(err))
  })

  it('Post /api/login', done => {
    request.post('/api/login')
      .send(test_user)
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        done()
        jwt = data.result.token
      })
  })

  it('Post /api/tag', done => {
    const promises = []
    for (let i = 0; i < 10; ++i) {
      let test_tag = {
        name: 'nodejs_' + i,
        description: 'related to nodejs_' + i
      }
      const promise = request.post('/api/tag')
        .set('Authorization', jwt)
        .send(test_tag)
        .expect('Content-type', /json/)
        .expect(200)
      promises.push(promise)
    }
    Promise.all(promises).then(responses => {
      const firstData = responses[0].body
      expect(firstData).to.be.a('object')
      expect(firstData.code).to.equal(1)
      done()
    })
  })

  // without logon
  it('Get /api/tags without logon', done => {
    request.get('/api/tags')
      .query({ keyword: 'nodejs' })
      .expect('Content-type', /json/)    
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        expect(data.result).to.be.a('object')
        expect(data.result.pagination.page_size).to.equal(18)
        expect(data.result.pagination.total).to.equal(10)
        expect(data.result).to.be.a('object').that.nested.includes({'list[0].count': 0})
        expect(data.result.list[0].name).to.match(/nodejs/, 'keyword search wrong :(')
        done()
        tagId = data.result.list[0]._id
      })
  })

  // with logon
  it('Get /api/tags with logon', done => {
    request.get('/api/tags')
      .set('Authorization', jwt)
      .query({ keyword: 'nodejs' })
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        expect(data.result).to.have.property('list')
        expect(data.result.pagination.page_size).to.equal(18)
        expect(data.result.pagination.total).to.equal(10)
        expect(data.result.list[0].name).to.match(/nodejs/, 'keyword search wrong :(')
        done()
        data.result.list.forEach((tag, index) => {
          if (index <= 5) {
            tagIds.push(tag._id)
          }  
        })
      })
  })
  
  it('Patch /api/tags', done => {
    request.patch('/api/tags')
      .set('Authorization', jwt)
      .send({ ids: tagIds })
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        done()    
      })
  })

  it('Put /api/tag', done => {
    request.put(`/api/tag/${tagId}`)
      .set('Authorization', jwt)
      .send({ name: 'test_nodejs_tag', description: 'modified_tag' })
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        expect(data.result._id).to.equal(tagId)
        expect(data.result.name).to.equal('test_nodejs_tag')
        expect(data.result.description).to.equal('modified_tag')
        done()
      })
  })

  it('Delete /api/tag', done => {
    request.delete(`/api/tag/${tagId}`)
      .set('Authorization', jwt)
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        done()
      })
  })

})