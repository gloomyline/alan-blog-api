/*
* @Author: AlanWang
* @Date:   2018-03-29 15:01:03
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-29 15:15:24
*/
const config = require('../config')
// const controller = require('../controller')
const authIsVerified = require('../utils/auth')
const Router = require('koa-router')

const router = new Router({
  prefix: config.APP.ROOT_PATH
})

router.get('/', (ctx, next) => {
  ctx.response.body = config.INFO
}).get('/hello', (ctx, next) => {
  ctx.body = 'Hello, World'
})

module.exports = router