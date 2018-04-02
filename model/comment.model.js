/*
* @Author: AlanWang
* @Date:   2018-04-02 14:27:19
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-02 14:45:44
*/

const mongoose = require('../mongodb').mongoose
const paginate = require('mongoose-paginate')
const autoIncrement = require('mongoose-auto-increment')

// initialize auto-increment id
autoIncrement.initialize(mongoose.connection)

const commentSchema = new mongoose.Schema({
  // which post dose the comment belong to, number '0' prefer to systerm message board
  post_id: { type: Number, required: true },
  // pid, number '0' prefer to default message
  pid: { type: Number, default: 0 },
  content: { type: String, required: true, validate: /\S+/ },
  likes: { type: Number, default: 0 },
  ip: { type: String },
  address: {
    city: { type: String },
    range: {type: String },
    country: { type: String }
  },
  agent: { type: String, validate: /\S+/ },
  // who did comment it
  author: {
    name: { type: String, required: true, validate: /\S+/ },
    email: {
      type: String,
      required: true,
      validate: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/
    },
    site: {
      type: String,
      validate: /^((https|http):\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/
    }
  },
  // 0 => waiting review, 1 => passed, 2 => rejected
  state: { type: Number, default: 1 },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date }
})

// paginate + autoincrement
commentSchema.plugin(paginate)
commentSchema.plugin(autoIncrement.plugin, {
  model: 'Comment',
  field: 'id',
  startAt: 1,
  incrementBy: 1
})

// time update
commentSchema.pre('findOneAndUpdate', function(next) {
  this.findOneAndUpdate({}, { update_at: Date.now() })
  next()
})

module.exports = mongoose.model('Comment', commentSchema)