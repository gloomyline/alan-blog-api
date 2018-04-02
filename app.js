/*
* @Author: AlanWang
* @Date:   2018-03-29 11:46:10
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-30 17:50:44
*/
const Koa = require('koa2')
const http = require('http')
const config = require('./config')
const koaBody = require('koa-body') // Parse request's body when use method Post
const helmet = require('koa-helmet') // For security
const mongoosePainate = require('mongoose-paginate') // paginate
// const cors = require('koa-cors') // cross-origin-allow
const initAdmin = require('./middlewares/initAdmin')
const interceptor = require('./middlewares/interceptor')

// db
const mongodb = require('./mongodb')
mongodb.connect()

mongoosePainate.paginate.options = {
  limit: config.APP.LIMIT
}

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
app.use(interceptor)

app.use(initAdmin)

app.use(helmet())
app.use(koaBody({
  jsonLimit: '10mb',
  formLimit: '10mb',
  textLimit: '10mb'
}))


// 404 500 error
let err_count = 0
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    console.error(err_count, e)
    ctx.body = { code: 0, message: 'Server Internal Error!' }
  }
  if (ctx.status === 404 || ctx.status === 405) {
    ctx.body = { code: 0, message: 'Invalid API Request!' }
  }
})

app.use(router.routes()).use(router.allowedMethods())

// start server
const port = config.APP.PORT
http.createServer(app.callback()).listen(port, () => {
  console.log(`Node-Koa is Running, listening port at ${port} - ${Date()}`)  
})
