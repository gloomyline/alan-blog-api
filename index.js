/*
* @Author: AlanWang
* @Date:   2018-03-29 11:46:10
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-29 15:22:57
*/
const Koa = require('koa2')
const http = require('http')
const config = require('./config')
// const koaBody = require('koa-body') // Parse request's body when use method Post
// const helmet = require('koa-helmet') // For security
// const mongoosePainate = require('mongoose-paginate') // paginate
// const cors = require('koa-cors') // cross-origin-allow
// const initAdmin = require('./middlewares/initAdmin')
// const interceptor = require('./middlewares/interceptor')

// db
const mongodb = require('./mongodb')
mongodb.connect()

// routes
const router = require('./routes')

// instanced app
const app = new Koa()

app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// middlewares

// 404 500 error
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    ctx.body = { code: 0, message: 'Server Internal Server!' }
  }
  if (ctx.status === 404 || ctx.status === 405) {
    ctx.body = { code: 0, message: 'Invalid API Request!' }
  }
})

app.use(router.routes()).use(router.allowedMethods())

// start server
const port = config.APP.PORT
http.createServer(app.callback()).listen(port, () => {
  console.log(`Node-Koa is Running, listening port at ${port}`)  
})
