const Router = require('koa-router');
const blogCtrl = require('./blog.ctrl');

const blog = new Router();

blog.get('/list', blogCtrl.listAll);
blog.get('/list/:useremail', blogCtrl.listUser);
blog.post('/write', blogCtrl.write);

module.exports = blog;