/*
* @Author: AlanWang
* @Date:   2018-03-29 16:52:10
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-08 14:14:35
*/
const chalk = require('chalk')

/**
 * colorful logs
 * @param  {String}  color  
 * @param  {Boolean} isBold
 * @param  {String}  text
 * @return {}
 */
function log (text = null, color = 'green', isBold = false) {
  const definedColors = ['red', 'green', 'blue', 'yellow']
  if (!definedColors.includes(color)) {
    console.log(chalk.red('Colors only contain red, green, blue and yellow :('))
    return
  }
  if (!!isBold) {
    console.log(chalk[color]['blod'](text))
  } else {
    console.log(chalk[color](text))
  }
}

function handleSuccess ({ ctx, message = 'Rquest Successfully!', result = null }) {
  ctx.body = { code: 1, message, result }
}

function handleError ({ ctx, message = 'Request Unsuccessfully!', err = null }) {
  ctx.response.body =  { code: 0, message, debug: err }
}


module.exports = {
  log,
  handleSuccess,
  handleError
}