/*
* @Author: AlanWang
* @Date:   2018-03-30 14:19:40
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-30 14:31:50
*/

/**
 * Hero Model
 */

const mongoose = require('../mongodb').mongoose
const autoIncrement = require('mongoose-auto-increment')
const mongoosePaginate = require('mongoose-paginate')

// Init ID auto-increment
autoIncrement.initialize(mongoose.connection)

const heroSchema = new mongoose.Schema({
  name: { type: String },
  content: {
    type: String,
    required: true,
    validate: /\S+/
  },
  // 0 -> waiting reviewing, 1 -> review passed, 2 -> review unsanctioned
  state: {
    type: Number,
    default: 0
  },
  ip: { type: String },
  // ip actual address
  address: {
    city: { type: String },
    range: { type: String },
    country: { type: String }
  },
  // user agent
  agent: { type: String, validate: /\S+/ },
  // release time
  create_at: { type: Date, default: Date.now }
})

// paginate + ID auto-increment plugin settings
heroSchema.plugin(mongoosePaginate)
heroSchema.plugin(autoIncrement.plugin, {
  model: 'Heros',
  field: 'id',
  startAt: 1,
  incrementBy: 1
})

const Hero = mongoose.model('Hero', heroSchema)

module.exports = Hero