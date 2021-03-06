/*
* @Author: AlanWang
* @Date:   2018-03-29 14:52:19
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-29 17:56:33
*/
const config = require('../config')
const jwt = require('jsonwebtoken')

// Authenticate the token in authorization
const authToken = req => {
  if (req.headers && req.headers.authorization) {
    // const parts = req.headers.authorization.split(' ')
    // if (Object.is(parts.length, 2) && Object.is(parts[0], 'Bearer')) {
    //   return parts[1]
    //   console.log(22, parts[1])
    // }
    return req.headers.authorization
  }
  return false
}

// Authenticate the user's priority
const authIsVerified = req => {
  const token = authToken(req)
  if (token) {
    try {
      const decodedToken = jwt.verify(token, config.AUTH.jwtTokenSecret)
      if (decodedToken.exp > Math.floor(Date.now() / 1000)) {
        return true
      }
    } catch (err) {
      console.log(err)
    }
  }
  return false
}

module.exports = authIsVerified
