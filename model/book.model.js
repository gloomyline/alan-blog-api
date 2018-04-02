/*
* @Author: AlanWang
* @Date:   2018-04-02 16:46:56
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-02 17:31:31
*/
const mongoose = require('../mongodb').mongoose
const paginate = require('mongoose-paginate')
const autoIncrement = require('mongoose-auto-increment')

// initialize ID auto-increment
autoIncrement.initialize(mongoose.connection)

const bookSchema = new mongoose.Schema({
  name: { type: String, required: true, validate: /\S+/ },
  state: { type: Number, default: 1 },
  description: String,
  thumb: String,
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date }
})

bookSchema.plugin(paginate)
bookSchema.plugin(autoIncrement.plugin, {
  model: 'Book',
  field: 'id',
  startAt: 1,
  incrementBy: 1
})

// time update
bookSchema.pre('findOneAndUpdate', function(next) {
  this.findOneAndUpdate({}, { update_at: Date.now() })
  next()
})

module.exports = mongoose.model('Book', bookSchema)