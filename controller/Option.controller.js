/*
* @Author: AlanWang
* @Date:   2018-03-30 12:05:18
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-30 14:12:16
*/

/**
 * Sites info controller
 */
const Option = require('../model/option.model')
const {
  handleSuccess,
  handleError
} = require('../utils/handle')

class OptionoController {
  static async getOption (ctx) {
    const option = await Option.findOne().catch(err => ctx.throw(500, 'Server Internal Error'))
    if (option) {
      handleSuccess({ ctx, result: option, message: 'Fetch options successfully!' })
    } else {
      handleError({ ctx, message: 'Fetch options unsuccessfully!' })
    }
  }

  static async putOption (ctx) {
    const _id = ctx.request.body._id
    const option = await (_id
      ? Option.findByIdAndUpdate(_id, ctx.request.body, { new: true })
      : new Option(ctx.request.body).save())
      .catch(err => ctx.throw(500, 'Server Internal Error!'))
    if (option) {
      handleSuccess({ ctx, result: option._id, message: 'Modified options successfully!' })
    } else {
      handleError({ ctx, message: 'Modified options unsuccessfully!' })
    }
  }
}

module.exports = OptionoController