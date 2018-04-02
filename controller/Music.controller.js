/*
* @Author: AlanWang
* @Date:   2018-04-02 16:21:46
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-02 16:40:58
*/

const request = require('request')
const NeteaseMusic = require('simple-netease-cloud-music')
const neteaseMusic = new NeteaseMusic()
const {
  log,
  handleError,
  handleSuccess
} = require('../utils/handle')

class MusicController {
  static async getList (ctx) {
    const play_list_id = ctx.params.play_list_id
    if (!play_list_id || Object.is(Number(play_list_id), NaN)) {
      handleError({ ctx, message: 'Invalid params :(' })
      return false
    }
    const { playList } = await neteaseMusic.playlist(play_list_id)
    handleSuccess({ ctx, result: playList, message: 'Music play list fetched successfully :)' })
  }

  static async getSong (ctx) {
    const song_id = ctx.params.song_id
    if (!song_id || Object.is(Number(song_id), NaN)) {
      handleError({ ctx, message: 'Invalid params :(' })
      return false
    }
    const result = await neteaseMusic.song(song_id, 128)
    handleSuccess({ ctx, result, message: 'Fetched detail of song successfully :)' })
  }

  static async getUrl (ctx) {
    const song_id = ctx.params.song_id
    if (!song_id || Object.is(Number(song_id), NaN)) {
      handleError({ ctx, message: 'Invalid params :(' })
      return false
    }
    const result = await neteaseMusic.url(song_id, 700)
    handleSuccess({ ctx, result, message: 'Fetched url of song successfully :)' })
  }

  static async getLrc (ctx) {
    const song_id = ctx.params.song_id

    if (!song_id || Object.is(Number(song_id), NaN)) {
      handleError({ ctx, message: 'Invalid params :(' })
      return false
    }

    const result = await neteaseMusic.lrc(song_id)
    handleSuccess({ ct, result, message: 'Fetched lrc of song successfully :)' })
  }

  static async getPic (ctx) {
    const { pic_id } = ctx.params

    if (!pic_id || Object.is(Number(pic_id), NaN)) {
      handleError({ ctx, message: 'Invalid params!' })
      return false
    }
    const result = await neteaseMusic.picture(pic_id, 700)
    handleSuccess({ ctx, result, message: 'Picture of the song was fetched successfully :)' })
  }
}

module.exports = MusicController