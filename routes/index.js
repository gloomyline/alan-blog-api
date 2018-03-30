/*
* @Author: AlanWang
* @Date:   2018-03-29 15:01:03
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-30 12:06:53
*/
const config = require('../config')
const Controller = require('../controller')
const authIsVerified = require('../utils/auth')
const Router = require('koa-router')

const router = new Router({
  prefix: config.APP.ROOT_PATH
})

router.get('/', (ctx, next) => {
  ctx.response.body = config.INFO
})
  .get('/auth', Controller.Auth.getAuth)
  .put('/auth', Controller.Auth.putAuth)
  .post('/login', Controller.Auth.login)

  .get('/option', Controller.Option.getOption)
  .put('/option', Controller.Option.putOption)

module.exports = router