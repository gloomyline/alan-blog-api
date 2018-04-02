/*
* @Author: AlanWang
* @Date:   2018-04-02 14:24:32
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-02 16:02:25
*/

const Comment = require('../model/comment.model')
const Article = require('../model/article.model')
const { sendMail } = require('../utils/email')
const authIsVerified = require('../utils/auth')
const geoip = require('geoip-lite')
const {
  log,
  handleSuccess,
  handleError
} = require('../utils/handle')

// update aggregation data of current relative articles
const updateArticleCommentCount = (post_ids = []) => {
  post_ids = [...new Set(post_ids)].filter(id => !!id)
  if (post_ids.length) {
    Comment.aggregate([
      { $match: { state: 1, post_id: { $in: post_ids }}},
      { $group: { _id: "$post_id", num_tutorial: { $num: 1}}}
    ])
    .then(counts => {
      if (counts.length === 0) {
        Article.update({ id: post_ids[0] }, { $set: { 'meta.comments': 0 }})
        .then(info => {})
        .catch(err => {})
      } else {
        counts.forEach(count => {
          Article.update({ id: count._id }, { $set: { 'meta.comments': count.num_tutorial }})
          .then(info => {})
          .catch(err => {})
        })
      }
    })
    .catch(err => {
      log(`Query failed before aggregating the count data of comments\n${ err }`, 'red')
    })
  }
}

// send notice to me and the author of the comment
const sendMailToAdminAndTargetUser = (comment, permalink) => {
  sendMail({
    to: 'gloomyline@foxmail.com',
    subject: 'New comment in your blog',
    text: `from ${ comment.author.name }, content is \n ${comment.content}`,
    html: `<h2>There is a new comment from ${comment.author.name}</h2>
    <p>${comment.conetent}</p></br><a href="${permalink}" target="_blank">[ click here! ]</a>`
  })
  if (!!comment.pid) {
    Comment.findOne({ id: comment.pid }).then(parentComment => {
      sendMail({
        to: parentComment.author.email,
        subject: 'There is a new reply in your comment under alannala.club.',
        text: `from ${comment.author.name}, content is:\n${ comment.content }`,
        html: `<h2>There is a new comment from ${comment.author.name}</h2>
        <p>${comment.conetent}</p></br><a href="${permalink}" target="_blank">[ click here! ]</a>`
      })
    })
  }
}

class CommentsController {
  static async getComments (ctx) {
    const {
      sort = -1,
      current_page = 1,
      page_size = 20,
      keyword = '',
      post_id,
      state
    } = ctx.query

    sort = Number(sort)

    // filter conditions
    const opts = {
      sort: { _id: sort },
      page: Number(current_page),
      limit: Number(page_size)
    }

    // fileds which is used to sort according to
    if ([1, -1].includes(sort)) {
      opts.sort = { _id: sort }
    } else if (Object.is(sort, 2)) {
      opts.sort = { likes: -1 }
    }

    // query parameters
    let querys = {}

    // states of query
    if (state && ['0', '1', '2'].includes(state)) {
      querys.state = state
    }

    // if request from frontend, reselt the publish and state
    if (!authIsVerified(ctx.request)) {
      querys.state = 1
    }

    // keyword
    if (keyword) {
      const keywordReg = new RegExp(keyword)
      querys['$or'] = [
        { 'content': keywordReg },
        { 'author.name': keywordReg },
        { 'author.email': keywordReg }
      ]
    }

    // filter by post-id
    if (!Object.is(post_id, undefined)) {
      querys.post_id = post_id
    }

    const comments = await Comment
      .paginate(querys, opts)
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (comments) {
      handleSuccess({
        ctx,
        message: 'Fetched comments successfully :)',
        result: {
          pagination: {
            total: comments.total,
            current_page: opts.page,
            total_page: comments.pages,
            per_page: opts.limit
          },
          data: comments.docs
        }
      })
    } else {
      handleError({ ctx, message: 'Fetched comments failed :(' })
    }
  }

  static async postComment (ctx) {
    let { body: comment } = ctx.request

    // get ip and address
    const ip = (ctx.req.headers['x-forwarded-for'] || 
    ctx.req.headers['x-real-ip'] || 
    ctx.req.connection.remoteAddress || 
    ctx.req.socket.remoteAddress ||
    ctx.req.connection.socket.remoteAddress ||
    ctx.req.ip ||
    ctx.req.ips[0]).replace('::ffff:', '');
    comment.ip = ip
    comment.agent = ctx.headers['user-agent'] || comment.agent

    const ip_location = geoip.lookup(ip)

    if (ip_location) {
      comment.address.city = ip_location.city,
      comment.address.range = ip_location.range,
      comment.address.country = ip_location.country
    }

    comment.likes = 0
    comment.author = JSON.parse(comment.author)

    let permalink
    if (Number(comment.post_id) !== 0) {
      const article = await Article
        .findOne({ id: comment.post_id }, '_id')
        .catch(err => ctx.throw(500, 'Server Internal Error :('))
      permalink = `https://alannala.club/article/${article._id}`
    } else {
      permalink = 'https://alannala.club/about'
    }

    const result = await new Comment(comment)
      .save()
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      handleSuccess({
        ctx,
        result,
        message: 'Comment released successfully :)'
      })
      sendMailToAdminAndTargetUser(result, permalink)
      updateArticleCommentCount([res.post_id])
    } else {
      handleError({ ctx, message: 'Comment released failed :(' })
    }
  }

  static async patchComment (ctx) {
    const { _id } = ctx.params

    let { post_ids, state } = ctx.request.body

    if (!state || !post_ids) {
      ctx.throw(401, 'Invalid params')
      return false
    }

    post_ids = Array.of(Number(post_ids))

    const result = await Comment
      .findByIdAndUpdate(_id, { state })
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      handleSuccess({ ctx, message: 'Comment state modified successfully :)' })
      updateArticleCommentCount(post_ids)
    } else {
      handleError({ ctx, message: 'Comment state modified failed :(' })
    }
  }

  static async deleteComment (ctx) {
    const { _id } = ctx.params

    const post_ids = Array.of(Number(ctx.query.post_ids))

    const result = await Comment
      .findByIdAndRemove(_id)
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      handleSuccess({ ctx, message: 'Comment removed successfully :)' })
      updateArticleCommentCount(post_ids)
    } else {
      handleError({ ctx, message: 'Comment removed failed :(' })
    }
  }
}

module.exports = CommentsController