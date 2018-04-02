/*
* @Author: AlanWang
* @Date:   2018-03-29 15:01:03
* @Last Modified by:   AlanWang
<<<<<<< HEAD
* @Last Modified time: 2018-04-02 16:16:14
=======
* @Last Modified time: 2018-04-02 12:00:46
>>>>>>> fc56c54ee59bb3ed25b1d08c913a7e086dc60fbe
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
  .patch('/tag', Controller.Tag.patchTag)
  .put('/tag/:id', Controller.Tag.putTag)
  .delete('/tag/:id', Controller.Tag.deleteTag)

  .get('/articles', Controller.Article.getArticles)
  .post('/article', Controller.Article.postArticle)
  .get('/article', Controller.Article.getArticle)
  .patch('/article', Controller.Article.patchArticle)
  .put('/article/:id', Controller.Article.putArticle)
  .delete('/article/:id', Controller.Article.deleteArticle)
  .get('/allArticle', Controller.Article.getAllArticles)

  .get('/comments', Controller.Comments.getComments)
  .post('/comment', Controller.Comments.postComment)
  .patch('/comment', Controller.Comments.patchComment)
  .delete('/comment', Controller.Comments.deleteComment)

  .post('like', Controller.Like.postLike)

module.exports = router