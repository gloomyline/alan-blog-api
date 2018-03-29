/*
* @Author: AlanWang
* @Date:   2018-03-29 16:52:10
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-03-29 16:55:48
*/
function handleSuccess ({ ctx, message = 'Rquest Successfully!', result = null }) {
  ctx.body = { code: 0, message, result }
}

function handleError ({ ctx, message = 'Request Unsuccessfully!', err = null }) {
  ctx.response.body =  { code: 1, message, debug: err }
}


module.exports = {
  handleSuccess,
  handleError
}