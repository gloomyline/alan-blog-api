/*
* @Author: AlanWang
* @Date:   2018-04-02 16:05:31
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-02 16:16:09
*/

const Article = require('../model/article.model')
const Comment = require('../model/comment.model')

const {
  handleSuccess,
  handleError
} = require('../utils/handle')

class LikeController {
  static async postLike (ctx) {
    const { _id, type } = ctx.request.body

    if (!_id || !type || ![0, 1].includs(Number(type))) {
      handleError({ ctx, message: 'Invalid params' })
      return false
    }

    // type = 0 artice, type = 1 comment
    const result = await (Number(type) === 0 ? Article : Comment)
      .findById(_id)
      .catch(err => ctx.throw(500, 'Server Internal Error!'))
    if (result) {
      if (Number(type === 0)) {
        result.meta.likes += 1
      } else {
        result.likes += 1
      }
      const info = await result
        .save()
        .catch(err => ctx.throw(500, 'Server Internal Error'))
      if (info) {
        handleSuccess({ ctx, message: 'Like it as you wanna :)' })
      } else {
        handleError({ ctx, message: 'Like operation has failed' })
      }
    } else {
        handleError({ ctx, message: 'Like operation has failed' })
    }
  }
}

module.exports = LikeController