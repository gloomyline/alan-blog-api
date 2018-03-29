/*
* @Author: AlanWang
* @Date:   2018-03-29 14:40:47
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-29 15:47:04
*/

/**
 * Priority and UserData Model
 */

const crypto = require('crypto')
const config = require('../config')
const mongoose = require('../mongodb').mongoose

const authSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    default: config.AUTH.defaultUsername
  },
  slogan: {
    type: String,
    default: ''
  },
  gravatar: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    default: crypto.createHash('md5').update(config.AUTH.defaultPassword).digest('hex')
  }
})

const Auth = mongoose.model('Auth', authSchema)

module.exports = Auth