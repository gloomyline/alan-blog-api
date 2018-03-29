/*
* @Author: AlanWang
* @Date:   2018-03-29 13:30:34
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-29 16:07:29
*/
const authIsVerified = require('../utils/auth')

module.exports = async (ctx, next) => {
  const allowedOrigins = ['file://']
  const origin = ctx.request.headers.origin || ''
  if (allowedOrigins.includes(origin) || origin.includes('localhost')) {
    ctx.set('Access-Control-Allow-Origin', origin)
  }

  ctx.set({
    'Access-Control-Allow-Headers': 'Authorization, origin, No-Cache, X-Requested-with, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With',
    'Access-Control-Aloow-Methods': 'PUT, PATCH, POST, GET, DELETE, OPTIONS',
    'Access-Control-Max-Age': '1728000',
    'Content-type': 'application/json;charset=utf-8',
    'X-Powered-By': 'my_blog 1.0.0'
  })

  // OPTIONS
  if (ctx.request.method === 'OPTIONS') {
    ctx.status = 200
    return false
  }

  // If we are in the production environment,
  // we need to auth the request origin,
  // in order to avoid the abnormal request
  if (Object.is(process.env.NODE_ENV, 'production')) {
    const { origin, referer } = ctx.request.headers
    if (origin !== 'file://') {
      const originVerified = (!origin || origin.includes('alannala.club')) &&
                              (!referer || referer.includes('alannala.club'))
      if (!originVerified) {
        ctx.throw(403, { code: 0, message: 'Identity authenticated unsuccessfully' })
        return false
      }
    }
  }

  // Exculude the post request of Auth, Comment, Like and Hero
  const isLike = Object.is(ctx.request.url, '/api/like') &&
                  Object.is(ctx.request.method, 'POST')
  const isPostAuth = Object.is(ctx.request.url, '/api/auth') &&
                      Object.is(ctx.request.method, 'POST')
  const isLogin = Object.is(ctx.request.url, '/api/login') &&
                    Object.is(ctx.request.method, 'POST')
  const isHero = Object.is(ctx.request.url, '/api/hero') &&
                    Object.is(ctx.request.method, 'POST')
  const isPostComment = Object.is(ctx.request.url, '/api/comment') &&
                    Object.is(ctx.request.method, 'POST')
  if (isLike || isPostAuth || isPostComment || isLogin || isHero) {
    await next()
    return false
  }

  // Intercept all of Get request of people who are not Administrators
  if (!authIsVerified(ctx.request) && !Object.is(ctx.request.method, 'GET')) {
    ctx.throw(401, { code: -2, message: 'Identity authenticated unsuccessfully' })
    return false
  }

  await next()
}