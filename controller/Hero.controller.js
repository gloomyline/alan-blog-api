/*
* @Author: AlanWang
* @Date:   2018-03-30 14:17:29
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-30 17:53:12
*/

/**
 * Hero controller
 */

const Hero = require('../model/hero.model')
const config = require('../config')
const { handleSuccess, handleError } = require('../utils/handle')
const geoip = require('geoip-lite')
const authIsVerified = require('../utils/auth')
const { sendMail } = require('../utils/email')

class HeroController {
  // fetch messages from message board
  static async getHeros (ctx) {
    let {
      current_page = 1,
      page_size = 12,
      keyword = '',
      state = ''
    } = ctx.query

    // filter conditions
    const opts = {
      sort: { _id: +1 },
      page: Number(current_page),
      limit: Number(page_size)
    }

    // query parameters
    const querys = { name: new RegExp(keyword) }

    // review state
    if (['0', '1', '2'].includes(state)) {
      querys.state = Number(state)
    }

    // if request from frontend and is not authVerified,
    // only query the review passed, that is set the state to be '1'
    if (!authIsVerified(ctx.request)) {
      querys.state = 1
    }
    // query
    const qResult = await Hero
      .paginate(querys, opts)
      .catch(err => ctx.throw(500, 'Server Internet Error!'))
    if (qResult) {
      handleSuccess({
        ctx,
        result: {
          pagination: {
            total: qResult.total,
            current_page: qResult.page,
            total_page: qResult.pages,
            page_size: qResult.limit
          },
          list: qResult.docs
        },
        message: 'Heros list data fetched successfully!'
      })
    } else {
      handleError({ ctx, message: 'Fetched heros list data failed!' })
    }
  }

  // modify the message state in message board
  static async patchHero (ctx) {
    const { _id, state } = ctx.request.body

    if (!state) {
      ctx.throw(401, 'Invalid parameters.')
      return false
    }

    let result = await Hero
      .update({ _id }, { state })
      .catch(err => ctx.throw(500, 'Server Internal Error!'))

    if (result) {
      handleSuccess({ ctx, message: 'Modified message state successfully!' })
    } else {
      handleError({ ctx, message: 'Modified message state failed :(' })
    }
  }

  // delete the message
  static async deleteHero (ctx) {
    const _id = ctx.params.id

    if (!_id) {
      handleError({ ctx, message: 'Invalid parameters :(' })
    } else {
      let result = await Hero
        .findByIdAndRemove(_id)
        .catch(err => ctx.throw(500, 'Server Internal Error.'))
      if (result) {
        handleSuccess({ ctx, message: 'Delete message successfully :)' })
      } else {
        handleError({ ctx, message: 'Delete message failed :(' })
      }
    }
  }

  // release message
  static async postHero (ctx) {
    let { body: hero } = ctx.request
    // get the ip and address
    const ip = (ctx.req.headers['x-forwarded-for'] ||
      ctx.req.headers['x-real-ip'] ||
      ctx.req.connection.remoteAddress ||
      ctx.req.socket.remoteAddress ||
      ctx.req.connection.socket.remoteAddress ||
      ctx.req.ip ||
      ctx.req.ips[0]).replace('::ffff:', '')

    hero.state = 0
    hero.ip = ip
    hero.agent = ctx.headers['user-agent'] || hero.agent

    const ip_location = geoip.lookup(ip)
    if (ip_location) {
      hero.address.city = ip_location.city
      hero.address.range = ip_location.range,
      hero.address.country = ip_location.country
    }
    const result = new Hero(hero)
      .save()
      .catch(err => ctx.throw(500, 'Server Internal Error!'))
    if (result) {
      handleSuccess({ ctx, message: 'You have posted your message successfully, please wait patiently!' })
      sendMail({
        to: config.INFO.email,
        subject: 'There is a new message in your blog!',
        text: `From ${ hero.name }, the content is:\n${ hero.content }`,
        html: `<p>New message from ${hero.name}:\n ${hero.content}</p>`
      })
    } else {
      handleError({ ctx, message: 'Posted message failed :(' })
    }
  }

}

module.exports = HeroController