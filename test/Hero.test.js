const app = require('../app')
const supertest = require('supertest')
const expect = require('chai').expect
const Hero = require('../model/hero.model')
const config = require('../config')
const { log } = require('../utils/handle')

describe('::init app for testing Hero', () => {
  let server = null
  let request = null
  let jwt = null
  let heroId = null

  const test_user = {
    username: config.AUTH.defaultUsername,
    password: config.AUTH.defaultPassword
  }

  before(done => {
    server = app.listen(done)
    request = supertest.agent(server)
  })

  after(done => {
    // Hero.remove()
    //   .then(hero => {
    //     server.close(done)
    //     log('Removed the test hero data completely!')
    //   })
    //   .catch(err => {
    //     log(err, 'red')
    //   })
    server.close(done)
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


  it('Get /api/heros', done => {
    request.get('/api/heros')
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        // TODO: some more test here
        done()
      })
  })

  it('Post /api/hero', done => {
    const test_hero = {
      name: 'test_hero_name',
      content: 'test_hero_content'
    }
    request.post('/api/hero')
      .send(test_hero)
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        // TODO: some more test here
        const result = data.result
        expect(result.name).to.equal(test_hero.name)
        expect(result.content).to.equal(test_hero.content)
        done()
        heroId = data.result._id
      })
  })

  it('Patch /api/hero', done => {
    request.patch('/api/hero')
      .set('Authorization', jwt)
      .send({
        _id: heroId,
        state: 1
      })
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        // TODO: some more test here
        done()
      })
  })

  it('Delete /api/hero', done => {
    request.delete(`/api/hero/${heroId}`)
      .set('Authorization', jwt)
      .expect('Content-type', /json/)
      .expect(200)
      .then((res, err) => {
        if (err) return done(err)
        const data = res.body
        expect(data).to.be.a('object')
        expect(data.code).to.equal(1)
        // TODO: some more test here
        done()
      })
  })
})