/*
* @Author: AlanWang
* @Date:   2018-03-29 13:13:36
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-30 17:26:47
*/
const argv = require('yargs').argv

const MONGODB = {
  uri: `mongodb://127.0.0.1:${argv.dbport || '27017'}/my_blog`,
  username: argv.db_username || 'DB_username',
  password: argv.db_password || 'db_password'
}

const AUTH = {
  jwtTokenSecret: argv.auth_key || 'my_blog',
  defaultUsername: argv.auth_default_username || 'AlanWang',
  defaultPassword: argv.auth_default_password || 'your_admin_password'
}

const QINIU = {
  accessKey: argv.qn_accessKey || '',
  secretKey: argv.qn_secretKey || '',
  bucket: argv.qn_bucket || 'blog',
  origin: argv.qn_origin || 'http://blog.u.qiniudn.com',
  uploadURL: argv.qn_uploadURL || 'http://up.qiniu.com'
}

const EMAIL = {
  account: argv.email_account || 'alanjames007@qq.com',
  password: argv.email_password || 'your_email_password.'
}

const BAIDU = {
  site: argv.baidu_site || '',
  token: argv.baidu_token || ''
}

const APP = {
  ROOT_PATH: '/api',
  LIMIT: 16,
  PORT: 8888
}

const INFO = {
  name: 'my_blog',
  version: '1.0.0',
  author: 'AlanWang',
  email: 'gloomyline@foxmail.com',
  site: 'https://alannala.club',
  powerd: [
    'Vue2',
    'Nuxt.js',
    'Koa2',
    'Mongodb',
    'Nginx'
  ]
}

module.exports = {
  MONGODB,
  QINIU,
  AUTH,
  EMAIL,
  BAIDU,
  APP,
  INFO
}