/*
* @Author: AlanWang
* @Date:   2018-04-02 09:34:19
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-02 09:43:04
*/
const mongoose = require('../mongodb').mongoose
const autoIncrement = require('mongoose-auto-increment')
const mongoosePaginate = require('mongoose-paginate')

// Initialize auto-increment ID
autoIncrement.initialize(mongoose.connection)

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: /\S+/
  },
  description: String,
  create_at: {
    type: Date,
    default: Date.now
  },
  update_at: { type: Date },
  sort: { type: Number, default: 0 }
})

// paginate
tagSchema.plugin(mongoosePaginate)
tagSchema.plugin(autoIncrement.plugin, {
  model: 'Tag',
  field: 'id',
  startAt: 1,
  incrementBy: 1
})

// time update
tagSchema.pre('findOneAndUpdate', function(next) {
  this.findOneAndUpdate({}, { update_at: Date.now() })
  next()
})

module.exports = mongoose.model('Tag', tagSchema)