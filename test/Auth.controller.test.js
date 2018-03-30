/*
* @Author: AlanWang
* @Date:   2018-03-29 14:33:16
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-30 11:57:28
*/
const expect = require('chai').expect
const config = require('../config')
const AuthController = require('../controller/Auth.controller')

describe('Auth.controller test started!', () => {
  before(() => {
    // runs before all of tests in this block  
  })

  it('should login normally', async () => {
    const ctx = {
      request: {
        body: {
          username: config.AUTH.defaultUsername,
          password: config.AUTH.defaultPassword
        }
      }
    }

    await AuthController.login(ctx)
    expect(ctx.body.result).to.have.property('token')
  })
})