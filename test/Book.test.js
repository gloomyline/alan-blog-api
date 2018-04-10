/*
* @Author: AlanWang
* @Date:   2018-04-10 15:12:49
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-10 17:39:35
*/

const app = require('../app')
const Book = require('../model/book.model')
const supertest = require('supertest')
const expect = require('chai').expect
const auth = require('../config').AUTH
const { log } = require('../utils/handle')

describe('init::app for book test', () => {
  const test_user = {
    username: auth.defaultUsername,
    password: auth.defaultPassword
  }
  let server = null
  let request = null
  let jwt = null
  let bookId = null

  before(done => {
    server = app.listen(done)
    request = supertest.agent(server)
  })

  after(done => {
    Book.remove().then(book => {
      server.close(done)
      log('Test book documents clean up completely!')
    }).catch(err => {
      return done(err)
    })
    // server.close(done)
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

  it('Post /api/book in queue', done => {
    const promises = []
    for (let i = 0; i < 10; i++) {
      let book = {
        name: `test_book_${i}`,
        state: Math.random() > .9 ? 1 : 2,
        description: `desc_${i}`,
        thumb: `thumb_${i}`
      }
      const promise = request.post('/api/book')
        .set('Authorization', jwt)
        .send(book)
        .expect('Content-type', /json/)
        .expect(200)
      promises.push(promise)
    }
    Promise.all(promises)
      .then(responses => {
        const data = responses[0].body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        done()
      })
  })

  // search book by keyword of book's name
  it('Get /api/book by delivery keyword', done => {
    request.get('/api/book')
      .query({ keyword: '6', state: 1 })
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        expect(data.result.pagination).to.be.a('object').that.deep.equals({
          total: 1,
          current_page: 1,
          total_page: 1,
          page_size: 18
        })
        expect(data.result.list).to.be.an('array').that.has.lengthOf(1)
        done()
        bookId = data.result.list[0]._id
      })
  })

  // get book list
  it('Get /api/book for book list', done => {
    request.get('/api/book')
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        expect(data.result.list).to.be.an('array').that.has.lengthOf(10)
        done()
      })
  })

  it('Put /api/boo/:id', done => {
    request.put(`/api/book/${bookId}`)
      .set('Authorization', jwt)
      .send({
        name: 'modified_test_book',
        description: 'modified_desc',
        thumb: 'modified_thumb'
      })
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data.code).to.equal(1)
        done()
      })
  })

  it('Patch /api/book/:id', done => {
    request.patch(`/api/book/${bookId}`)
      .set('Authorization', jwt)
      .send({ state: 2 })
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

  it('Delete /api/book/:id', done => {
    request.delete(`/api/book/${bookId}`)
      .set('Authorization', jwt)
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data.code).to.equal(1)
        done()
      })
  })
})