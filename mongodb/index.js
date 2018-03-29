/*
* @Author: AlanWang
* @Date:   2018-03-29 14:46:30
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-29 15:06:16
*/
const mongoose = require('mongoose')
const config = require('../config')

mongoose.Promise = global.Promise

exports.mongoose = mongoose

exports.connect = () => {
  // conecting
  mongoose.connect(config.MONGODB.uri)

  // if fail
  mongoose.connection.on('error', error => {
    console.log('Connection to the db failed:(', error)
  })

  // success
  mongoose.connection.once('open', () => {
    console.log('Connection to the db success!')
  })

  return mongoose
}