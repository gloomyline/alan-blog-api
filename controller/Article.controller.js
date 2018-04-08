/*
* @Author: AlanWang
* @Date:   2018-04-02 10:56:27
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-08 17:12:41
*/

const request = require('request')
const Article = require('../model/article.model')
const authIsVerified = require('../utils/auth')
const config = require('../config')
const {
  log,
  handleSuccess,
  handleError
} = require('../utils/handle')


class ArticleController {
  // fetch articles list
  static async getArticles (ctx) {
    const {
      current_page = 1,
      page_size = 10,
      keyword = '',
      state = 1,
      publish = 1,
      tag,
      cart,
      date,
      hot
    } = ctx.query

    // filter conditions
    const opts = {
      sort: { create_at: -1 },
      page: Number(current_page),
      limit: Number(page_size),
      populate: ['tag'],
      select: '-content'
    }

    // params
    const querys = {}

    // keyword
    if (keyword) {
      const keywordReg = new RegExp(keyword)
      querys['$or'] = [
        { 'title': keywordReg },
        { 'content': keywordReg },
        { 'description': keywordReg }
      ]
    }

    // state query
    if (['1', '2'].includes(state)) {
      querys.state = state
    }

    // publish query
    if (['1', '2'].includes(publish)) {
      querys.publish = publish
    }

    // cart query
    if (['1', '2', '3'].includes(cart)) {
      querys.cart = cart
    }

    // hot query
    if (hot) {
      opts.sort = {
        'meta.views': -1,
        'meta.likes': -1,
        'meta.comments': -1
      }
    }

    // time query
    if (date) {
      const getDate = new Date(date)
      if (!Object.is(getDate.toString(), 'Invalid date')) {
        querys.create_at = {
          '$gte': new Date((getDate / 1000 - 60 * 60 * 8) * 1000),
          '$lt': new Date((getDate / 1000 + 60 * 60 * 16) * 10000)
        }
      }
    }

    // tag query
    if (tag) {
      querys.tag = tag
    }

    // if request from frontend, reset the state and publish
    if (!authIsVerified(ctx.request)) {
      querys.state = 1
      querys.publish = 1
    }

    const result = await Article
      .paginate(querys, options)
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      handleSuccess({
        ctx,
        result: {
          pagination: {
            total: result.total,
            current_page: result.page,
            total_page: result.pages,
            page_size: result.limit
          },
          list: result.docs
        },
        message: 'Articles list data fetched successfully :)'
      })
    } else {
      handleError({ ctx, message: 'Articles list data fetched failed :(' })
    }
  }

  // add new article
  static async postArticle (ctx) {
    const result = await new Article(ctx.request.body)
      .save()
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      handleSuccess({ ctx, message: 'Add new article successfully :)' })
      // Baidu SEO push
      request.post({
        url: `http://data.zz.baidu.com/urls?site=${config.BAIDU.site}&token=${config.BAIDU.token}`,
        headers: { 'Content-Type': 'text/plain' },
        body: `${config.INFO.site}/article/${result._id}`
      }, (err, res, body) => {
        log(`Push results:\n${ body }`)
      })
    } else {
      handleError({ ctx, message: 'Add new article failed :(' })
    }
  }

  // get article by its ID
  static async getArticle (ctx) {
    const { _id } = ctx.params
    if (!_id) {
      handleError({ ctx, message: 'Invalid params :(' })
      return false
    }

    const result = await Article
      .findById(_id)
      .populate('tag')
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      // every request, increment the views count automatically
      result.meta.views += 1
      result.save()
      handleSuccess({ ctx, message: 'Article fetched successfully :)', result })
    } else {
      handleError({ ctx, message: 'Article fetched failed :(' })
    }
  }

  // modify the state and publish of appointed article by id
  static async patchArticle (ctx) {
    const { _id } = ctx.params
    const { state, publish } = ctx.request.body

    const querys = {}

    if (state) {
      querys.state = state
    }

    if (publish) {
      querys.publish = publish
    }

    if (!id) {
      handleError({ ctx, message: 'Invalid params, need id :(' })
      return false
    }

    const result = await Article
      .findByIdAndUpdate(_id, { querys })
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      handleSuccess({
        ctx,
        message: `Updated state(publish) article - ${ _id } successfully`,
        result
      })
    } else {
      handleError({ ctx, message: 'Updated state(publish) article failed :(' })
    }
  }

  // modify article by id
  static async putArticle (ctx) {
    const { _id } = ctx.params
    const { title, keyword, tag } = ctx.request.body

    delete ctx.request.body.create_at
    delete ctx.request.body.update_at
    delete ctx.request.body.meta

    if (!_id) {
      handleError({ ctx, message: 'Invalid params :(' })
      return false
    }

    if (!title || !keyword) {
      handleError({ ctx, message: 'Title and keyword are required :(' })
      return false
    }

    const result = await Article
      .findByIdAndUpdate(_id, { title, keyword }, { new: true })
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      handleSuccess({
        ctx,
        result,
        message: `Update article - ${ _id } successfully :)`,
      })
    } else {
      handleError({ ctx, message: `Update article - ${ _id } failed :(` })
    }
  }

  // remove appointed article be its ID
  static async deleteArticle (ctx) {
    const { _id } = ctx.params

    if (!_id) {
      handleError({ ctx, message: 'Invalid article id params :(' })
      return false
    }

    const result = await Article
      .findByIdAndRemove(_id)
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      handleSuccess({ ctx, result, message: 'Delete article successfully :)' })

      // Baidu SEO push
      request.post({
        url: `http://data.zz.baidu.com/del?site=${config.BAIDU.site}&
          token=${config.BAIDU.token}`,
          headers: { 'Content-Type': 'text/plain' },
          body: `${config.INFO.site}/article/${_id}`
      }, (err, res, body) => {
        log(`Result of Baidu delete:\n${body}`)
      })
    } else {
      handleError({ ctx, message: 'Delete article failed :(' })
    }
  }

  // articles pageonhole
  static async getAllArticles (ctx) {
    const current_page = 1
    const page_size = 999999

    // filter conditions
    const opts = {
      sort: { create_at: -1 },
      page: Number(current_page),
      limit: Number(page_size),
      populate: ['tag'],
      select: '-content'
    }

    // params
    const querys = {
      state: 1,
      publish: 1
    }

    // query
    const articles = await Article.aggregate([
        {
          $match: {
            state: 1,
            publish: 1
          }
        },
        {
          $project: {
            year: { $year: '$create_at' },
            month: { $month: '$create_at' },
            title: 1,
            create_at: 1
          }
        },
        {
          $group: {
            _id: {
              year: '$year',
              month: '$month'
            },
            article: {
              $push: {
                title: '$title',
                _id: '$_id',
                create_at: '$create_at'
              }
            }
          }
        }
      ])

    if (articles) {
      let yearList = [...new Set(articles.map(item => item._id.year))]
        .sort((a, b) => b - a)
        .map(item => {
          let monthList = []
          articles.forEach(n => {
            // the same year
            if (n._id.year === item) {
              monthList.push({
                month: n._id.month,
                articleList: n.article.reverse()
              })
            }
          })
          return { year: item, monthList: monthList.sort((a, b) => b.month - a.month) }
        })
      handleSuccess({ ctx, result: yearList, message: 'Pageonhole successfully :)' })
    } else {
      handleError({ ctx, message: 'Pageonhole failde :(' })
    }
  }
}

module.exports = ArticleController