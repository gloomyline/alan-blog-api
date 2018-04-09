/*
* @Author: AlanWang
* @Date:   2018-04-08 09:28:17
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-09 16:24:21
*/
const app = require('../app')
const config = require('../config')
const Article = require('../model/article.model')
const supertest = require('supertest')
const expect = require('chai').expect
const { log } = require('../utils/handle')

describe('init::app for article test:', () => {
  let server = null
  let request = null
  let jwt = null
  let articleId = null

  const testUser = {
    username: config.AUTH.defaultUsername,
    password: config.AUTH.defaultPassword
  }

  before(done => {
    server = app.listen(done)
    request = supertest.agent(server)
  })

  after(done => {
    // Article.remove().then(article => {
    //   log('Remove test articles document completely!')
    //   server.close(done)
    // }).catch(err => done(err))
    server.close(done)
  })

  it('Login firstly', done => {
    request.post('/api/login')
      .send(testUser)
      .expect(200)
      .expect('Content-type', /json/)
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

  it('Post /api/article', done => {
    const promises = []
    for (let i = 0; i < 10; ++i) {
      let article = {
        title: `title_${i}`,
        keyword: `keyword_${i}`,
        description: `description_${i}`,
        content: `content_${i}`
      }
      let promise = request.post('/api/article')
        .set('Authorization', jwt)
        .send(article)
        .expect(200)
        .expect('Content-type', /json/)
      promises.push(promise)
    }
    Promise.all(promises).then(responses => {
      const last_res = responses[responses.length - 1]
      const data = last_res.body
      expect(data).to.be.a('object')
      expect(data).to.have.property('code')
      expect(data.code).to.equal(1)
      done()
    })
  })

  it('Get /api/articles', done => {
    const article_querys = {}
    request.get('/api/articles')
      .query(article_querys)
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data).to.have.property('code')
        expect(data.code).to.equal(1)
        expect(data).to.have.property('result')
        expect(data.result).to.have.property('list')
        expect(data.result.list).to.have.lengthOf(10)
        done()
        articleId = data.result.list[0]._id
      })
  })

  it('Get /api/article', done => {
    request.get(`/api/article/${articleId}`)
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data).to.have.property('code')
        expect(data.code).to.equal(1)
        expect(data).to.have.property('result')
        expect(data.result).to.be.a('object')
        expect(data.result).to.have.property('id')
        done()
      })
  })

  it('Patch /api/article', done => {
    request.patch(`/api/article/${articleId}`)
      .set('Authorization', jwt)
      .expect('Content-type', /json/)
      .expect(200)
      .send({ state: 2, publish: 2 })
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data).to.have.property('code')
        expect(data.code).to.equal(1)
        expect(data).to.have.property('result')
        expect(data.result).to.have.property('state')
        expect(data.result.state).to.equal(2)
        expect(data.result).to.have.property('publish')
        expect(data.result.publish).to.equal(2)
        done()
      })
  })

  it('Put /api/article', done => {
    const testArticleModifies = {
      title: 'new_test_title',
      keyword: 'new_test_keyword'
    }
    request.put(`/api/article/${articleId}`)
      .set('Authorization', jwt)
      .send(testArticleModifies)
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data).to.have.property('code')
        expect(data.code).to.equal(1)
        expect(data).to.have.property('result')
        expect(data.result.title).to.equal(testArticleModifies.title)
        expect(data.result.keyword).to.equal(testArticleModifies.keyword)
        done()
      })
  })

  it('Delete /api/article', done => {
    request.delete(`/api/article/${articleId}`)
      .set('Authorization', jwt)
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data).to.have.property('code')
        expect(data.code).to.equal(1)
        done()
      })
  })

  it('Get /api/allArticles', done => {
    request.get('/api/allArticles')
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        expect(data.result).to.be.a('array')
        expect(data.result[0]).to.have.property('year')
        done()
      })
  })

})