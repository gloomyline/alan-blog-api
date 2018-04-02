/*
* @Author: AlanWang
* @Date:   2018-04-02 09:58:12
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-02 10:13:21
*/

const mongoose = require('../mongodb').mongoose
const autoIncrement = require('mongoose-auto-increment')
const paginate = require('mongoose-paginate')

// initialize auto-increment
autoIncrement.initialize(mongoose.connection)

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  keyword: { type: String, required: true },
  description: { type: String, required: true },
  tag: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  content: { type: String, required: true },
  // 1 => released, 2 => draft
  state: { type: Number, default: 1 },
  // 1 => public, 2 => private
  publish: { type: Number, default: 1 },
  thumb: String,
  // type of articles, 1 => code, 2 => idea, 3 => music
  cart: { type: Number },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  meta: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  }
})

// convert to common JS object
articleSchema.set('toObject', { getters: true })

// paginate + auto-increment
articleSchema.plugin(paginate)
articleSchema.plugin(autoIncrement.plugin, {
  model: 'Article',
  field: 'id',
  startAt: 1,
  incrementBy: 1
})

// update time
articleSchema.pre('findOneAndUpdate', function(next) {
  this.findOneAndUpdate({}, { update_at: Date.now() })
  next()
})

module.exports = mongoose.model('Article', articleSchema)