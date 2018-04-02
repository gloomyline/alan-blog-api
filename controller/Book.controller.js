/*
* @Author: AlanWang
* @Date:   2018-04-02 16:44:35
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-02 17:30:22
*/

const Book = require('../model/book.model')
const { handleSuccess, handleError } = require('../utils/handle')

class BookController {
  static async getBooks (ctx) {
    const {
      current_page = 1,
      page_size = 18,
      keyword = '',
      state = ''
    } = ctx.query

    // filter conditions
    const opts = {
      sort: { id: 1 },
      page: Number(current_page),
      limit: Number(page_size)
    }

    // params\
    const querys = { name: new RegExp(keyword) }

    // state
    if (['1', '2'].includes(state)) {
      querys.state = state
    }

    const book = await Book
      .paginate(querys, opts)
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (book) {
      handleSuccess({
        ctx,
        result: {
          pagination: {
            total: book.total,
            current_page: book.page,
            total_page: book.pages,
            page_size: book.limit
          },
          list: book.docs
        },
        message: 'Book list data fetched successfully :)'
      })
    } else {
      handleError({ ctx, message: 'Book list data fetched failed :(' })
    }
  }

  static async postBook (ctx) {
    const { name, description, thumb } = ctx.request.body

    const result = await Book
      .findOne({ name })
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result && result.length !== 0) {
      handleError({ ctx, message: 'The name has been used :(' })
      return false
    }

    const book = await new Book({
      name,
      description,
      thumb
    }).save()
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (book) {
      handleSuccess({ ctx, message: 'Released a new book successfully :)' })
    } else {
      handleError({ ctx, message: 'Released new book failed :(' })
    }
  }

  static async putBook (ctx) {
    const { _id } = ctx.params

    const { name, description, thumb } = ctx.request.body

    if (!_id) {
      ctx.throw(401, 'Invalid request :(')
      return false
    }

    const result = await Book
      .findByIdAndUpdate(_id, { name, description, thumb }, { new: true })
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      handleSuccess({ ctx, message: 'Modified data successfully :)' })
    } else {
      handleError({ ctx, message: 'Modified data failed :(' })
    }
  }

  static async patchBook (ctx) {
    const { _id } = ctx.params

    if (!_id) {
      ctx.throw(401, 'Invalid params')
      return false
    }

    const { state } = ctx.request.body

    let querys = {}

    if (state) {
      querys.state = state
    }

    const result = await Book
      .findByIdAndUpdate(_id, querys, { new: true })
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      handleSuccess({ ctx, message: 'Modified book state successfully :)' })
    } else {
      handleError({ ctx, message: 'Modified book state failed :(' })
    }
  }

  static async deleteBook (ctx) {
    const { _id } = ctx.params

    if (!_id) {
      ctx.throw(500, 'Invalid params!')
      return false
    }

    const result = await Book
      .findByIdAndRemove(_id)
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      handleSuccess({ ctx, message: 'Deleted the book successfully :)' })
    } else {
      handleError({ ctx, message: 'Deleted the book failed :(' })
    }
  }
}

module.exports = BookController