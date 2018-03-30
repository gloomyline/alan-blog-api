/*
* @Author: AlanWang
* @Date:   2018-03-29 16:25:07
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-30 10:22:57
*/

/**
 * Login and Auth Controller
 */
const Auth = require('../model/auth.model')
const config = require('../config')

const {
  handleError,
  handleSuccess
} = require('../utils/handle')

const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// md5 encode
const md5Encode = pwd => crypto
                          .createHash('md5')
                          .update(pwd)
                          .digest('hex')

class AuthController {
  // login
  static async login (ctx) {
    const { username, password } = ctx.request.body

    const auth = await Auth.findOne({ username }).catch(err => ctx.throw(500, 'Server Internal Error!'))
    if (auth) {
      if (auth.password === md5Encode(password)) {
        const token = jwt.sign({
          name: auth.name,
          password: auth.password,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 3)
        }, config.AUTH.jwtTokenSecret)
        handleSuccess({
          ctx,
          result: {
            token,
            expire: Math.floor(Date.now() / 1000) + 60 * 60 * 3
          }
        })
      } else {
        handleError({ ctx, message: 'Incorrect password!' })
      }
    } else {
      handleError({ ctx, message: 'Invalid account!' })
    }
  }

  // fetch user info
  static async getAuth (ctx) {
    const auth = await Auth.findOne({}, 'name username slogan gravatar').catch(err => ctx.throw(500, 'Server Internal Error!'))
    if (auth) {
      handleSuccess({ ctx, result: auth, message: 'Fetch user info successfully!' })
    } else {
      handleError({ ctx, message: 'Fetch user info unsuccessfully!' })
    }
  }

  // modify user info
  static async putAuth (ctx) {
    const {
      _id,
      name,
      username,
      slogan,
      gravatar,
      oldPassword,
      newPassword
    } = ctx.request.body
    const _auth = await Auth
                          .findOne({}, '_id name slogan gravatar password')
                          .catch(err => ctx.throw(500, 'Server Internal Error!'))
    if (_auth) {
      if (_auth.password !== md5Encode(oldPassword)) {
        handleError({ ctx, message: 'Incorrect password.' })
      } else {
        const password = (!newPassword) ? oldPassword : newPassword
        let auth = await Auth
                          .findByIdAndUpdate(_id, {
                            _id,
                            name,
                            username,
                            slogan,
                            gravatar,
                            password: md5Encode(password)
                          }, { new: true })
                          .catch(err => ctx.throw(500, 'Server Internal Error!'))
        if (auth) {
          handleSuccess({ ctx, result: auth, message: 'Modified user info successfully!' })
        } else {
          handleError({ ctx, message: 'Modified user info unsuccessfully!' })
        }
      }
    } else {
      handleError({ ctx, message: 'Modified user info unsuccessfully!' })
    }
  }
}

module.exports = AuthController