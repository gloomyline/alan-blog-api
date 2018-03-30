/*
* @Author: AlanWang
* @Date:   2018-03-30 15:32:03
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-30 17:29:19
*/
const config = require('../config')
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
      console.warn('The connection to email client initialized failed, ' + 
        'it will try an hour later.')
      setTimeout(verifyClient, 1000 * 60 * 60)
    } else {
      clientIsValid = true
      console.log('The connection to email client initialized successfully, ' + 
        'it is fully equiped for emailing.')
    }
  })
}
verifyClient()

const sendMail = mailOptions => {
  if (!clientIsValid) {
    console.warn('The sending mail request from email client was denied, ' +
      'because of the failure of client initializing :(')
    return false
  }

  mailOptions.from = '"gloomyline" <gloomyline@foxmail.com>'
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return console.warn('Sending email failed :(', err)
    } else {
      console.log("Sending email successfully :)", info.messageId, info.response)
    }
  })
}

module.exports = { sendMail, nodemailer, transporter }