/*
* @Author: AlanWang
* @Date:   2018-04-02 09:31:23
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-10 15:05:22
*/

const Tag = require('../model/tag.model')
const Article = require('../model/article.model')
const {
  log,
  handleSuccess,
  handleError
} = require('../utils/handle')

const authIsVerified = require('../utils/auth')

class TagController {
  // fetch tags list
  static async getTags (ctx) {
    const {
      current_page = 1,
      page_size = 18,
      keyword = ''
    } = ctx.query

    // filter conditions
    const opts = {
      sort: { sort: 1 },
      page: Number(current_page),
      limit: Number(page_size)
    }

    // parameters
    const querys = { name: new RegExp(keyword) }

    const tags = await Tag
      .paginate(querys, opts)
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (tags) {
      let tagClone = JSON.parse(JSON.stringify(tags))

      // query aggregation in articles
      let $match = {}

      // frontend request, only contains released and public
      if (!authIsVerified(ctx.request)) {
        $match = { state: 1, public: 1 }
      }

      const articles = await Article.aggregate([
          { $match },
          { $unwind: "$tag" },
          { $group: { _id: "$tag", num_tutorial: { $sum: 1 } } }
        ])
      if (articles) {
        tagClone.docs.forEach(t => {
          const finded = articles.find(c => String(c._id) === String(t._id))
          t.count = finded ? finded.num_tutorial : 0
        })
        handleSuccess({
          ctx,
          result: {
            pagination: {
              total: tagClone.total,
              current_page: tagClone.page,
              total_page: tagClone.pages,
              page_size: tagClone.limit
            },
            list: tagClone.docs
          },
          message: 'Tags list data fetched successfully :)'
        })
      } else {
        handleError({
          ctx, message: 'Tags list data fetched failed :(' +
            'Invalid tag realated articles!'
        })
      }
    } else {
      handleError({
        ctx,
        message: 'Tags list data fetched failed :(' +
          'Invalid tag keyword!'
      })
    }
  }

  // add tag
  static async postTag (ctx) {
    const { name, description } = ctx.request.body

    // validate there are the same name or not before adding
    const result = await Tag
      .find({ name })
      .catch(err => handleError({ ctx, message: 'Server Internal Error' }))
    if(result && result.length !== 0) {
      handleError({ ctx, message: 'The tag name has already existed :('})
      return false
    }

    const tag = await new Tag({ name, description })
      .save()
      .catch(err => handleError({ ctx, message: 'Server Internal Error' }))
    if (tag) {
      handleSuccess({ ctx, message: 'Adding new tag successfully :)', result: tag })
    } else {
      handleError({ ctx, message: 'Adding new tag error :(' })
    }
  }

  // sort tags
  static async patchTags (ctx) {
    const { ids } = ctx.request.body

    if (!Array.isArray(ids)) {
      handleError({ ctx, message: 'Invalid request body params,' +
        'ids need to be an Array consist of tag\'s id.' })
    }

    try {
      for (let i = 0; i < ids.length; ++i) {
        await Tag
          .findByIdAndUpdate(ids[i], { sort: i + 1 })
          .catch(err => ctx.throw(500, 'Server Internal Error :('))
      }
      handleSuccess({ ctx, message: 'Sorted the tags successfully :)' })
    } catch (e) {
      log(e, 'red')
      handleError({ ctx, message: 'Sorted the tags failed :(' })
    }
  }

  // modify the name of existed tag
  static async putTag (ctx) {
    const _id = ctx.params.id
    const { name, description } = ctx.request.body

    if (!_id) {
      handleError({ ctx, message: 'Invalid params :(' })
      return false
    }

    const result = await Tag
      .findByIdAndUpdate(_id, { name, description }, { new: true })
      .catch(err => ctx.throw(500, 'Server Internal Error!'))
    if (result) {
      handleSuccess({ ctx, result, message: 'Modified tag successfully :)' })
    } else {
      handleError({ ctx, message: 'Modified tag failed :(' })
    }
  }

  // delete tag
  static async deleteTag (ctx) {
    const _id = ctx.params.id

    if (!_id) {
      handleError({ ctx, message: 'Invalid params' })
      return false
    }

    let result = await Tag
      .findByIdAndRemove(_id)
      .catch(err => ctx.throw(500, 'Server Internal Error :('))
    if (result) {
      handleSuccess({ ctx, message: 'Removed the tag successfully :)' })
    } else {
      handleError({ ctx, message: 'Removed the tag failed :(' })
    }
  }
}

module.exports = TagController