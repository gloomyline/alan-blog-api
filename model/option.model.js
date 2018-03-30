/*
* @Author: AlanWang
* @Date:   2018-03-30 13:46:30
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-30 13:51:57
*/

/**
 * Options Model
 */

const mongoose = require('../mongodb').mongoose

const optionSchema = new mongoose.Schema({
  // website heading
  title: {
    type: String,
    required: true
  },
  // website subheading
  sub_title: {
    type: String,
    required: true
  },
  keyword: {
    type: String
  },
  description: String,
  url: {
    type: String,
    required: true
  },
  email: String,
  // internet content provider
  icp: String,
  meta: {
    likes: {
      type: Number,
      default: 0
    }
  }
})

const Option = mongoose.model('Option', optionSchema)

module.exports = Option
