/*
* @Author: AlanWang
* @Date:   2018-03-29 15:01:03
* @Last Modified by:   AlanWang
* @Last Modified time: 2018-04-10 15:01:45
*/
const config = require('../config')
const Controller = require('../controller')
const authIsVerified = require('../utils/auth')
const Router = require('koa-router')

const router = new Router({
  prefix: config.APP.ROOT_PATH
})

router.get('/', (ctx, next) => {
  ctx.response.body = config.INFO
})
  .get('/auth', Controller.Auth.getAuth)
  .put('/auth', Controller.Auth.putAuth)
  .post('/login', Controller.Auth.login)

  .get('/option', Controller.Option.getOption)
  .put('/option', Controller.Option.putOption)

  .get('/heros', Controller.Hero.getHeros)
  .post('/hero', Controller.Hero.postHero)
  .patch('/hero', Controller.Hero.patchHero)
  .delete('/hero/:id', Controller.Hero.deleteHero)

  .get('/tags', Controller.Tag.getTags)  
  .post('/tag', Controller.Tag.postTag)
  .patch('/tags', Controller.Tag.patchTags)
  .put('/tag/:id', Controller.Tag.putTag)
  .delete('/tag/:id', Controller.Tag.deleteTag)

  .get('/articles', Controller.Article.getArticles)
  .post('/article', Controller.Article.postArticle)
  .get('/article/:id', Controller.Article.getArticle)
  .patch('/article/:id', Controller.Article.patchArticle)
  .put('/article/:id', Controller.Article.putArticle)
  .delete('/article/:id', Controller.Article.deleteArticle)
  .get('/allArticles', Controller.Article.getAllArticles)

  .get('/comments', Controller.Comments.getComments)
  .post('/comment', Controller.Comments.postComment)
  .patch('/comment', Controller.Comments.patchComment)
  .delete('/comment', Controller.Comments.deleteComment)

  .post('like', Controller.Like.postLike)

  .get('/music/pic/:pic_id', Controller.Music.getPic)
  .get('/music/lrc/:song_id', Controller.Music.getLrc)
  .get('/music/url/:song_id', Controller.Music.getUrl)
  .get('/music/song/:song_id', Controller.Music.getSong)
  .get('/music/list/:play_list_id', Controller.Music.getList)

  .get('/book', Controller.Book.getBooks)
  .post('/book', Controller.Book.postBook)
  .patch('/book/:id', Controller.Book.patchBook)
  .put('/book/:id', Controller.Book.putBook)
  .delete('/book/:id', Controller.Book.deleteBook)

module.exports = router