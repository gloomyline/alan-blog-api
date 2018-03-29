const config = require('../config')
const Auth = require('../model/auth.model')
const crypto = require('crypto')

// md5
const md5Encode = pwd => {
  return crypto
          .createHash('md5')
          .update(pwd)
          .digest('hex')
}

// The middleware used to initial the account of Super Administrator
module.exports = async (ctx, next) => {
  const username = config.AUTH.defaultUsername
  const password = md5Encode(config.AUTH.defaultPassword)

  let result = await Auth
                      .find()
                      .exec()
                      .catch(err => {
                        ctx.throw(500, 'Server Internal Error - Cannot Find the Admin!')
                      })
  if (result.length  === 0) {
    let user = new Auth({
      username,
      password
    })
    await user
            .save()
            .catch(err => {
              ctx.throw(500, 'Server Internal Error - Cannot Save the Admin!')
            })
    console.log('Initial the Admin\'s account completely!')
  }
  await next()
}