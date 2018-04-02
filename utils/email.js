/*
* @Author: AlanWang
* @Date:   2018-03-30 15:32:03
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-02 09:23:46
*/
const config = require('../config')
const { log } = require('./handle')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
let clientIsValid = false

const transporter = nodemailer.createTransport(
  smtpTransport({
    host: 'smtp.qq.com',
    secure: true,
    port: 465,
    auth: {
      user: config.EMAIL.account,
      pass: config.EMAIL.password
    }
  })
)

const verifyClient = () => {
  transporter.verify((err, success) => {
    if (err) {
      clientIsValid = false
      log('The connection to email client initialized failed, ' + 
        'it will try an hour later.', 'red')
      setTimeout(verifyClient, 1000 * 60 * 60)
    } else {
      clientIsValid = true
      log('The connection to email client initialized successfully, ' + 
        'it is fully equiped for emailing.')
    }
  })
}
verifyClient()

const sendMail = mailOptions => {
  if (!clientIsValid) {
    log('The sending mail request from email client was denied, ' +
      'because of the failure of client initializing :(', 'red')
    return false
  }

  mailOptions.from = '"gloomyline" <gloomyline@foxmail.com>'
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return log(`Sending email failed :(', ${err}`, 'red')
    } else {
      log(`Sending email successfully :), ${info.messageId}, ${info.response}`)
    }
  })
}

module.exports = { sendMail, nodemailer, transporter }