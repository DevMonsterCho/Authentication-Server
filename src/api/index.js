const Router = require('koa-router');
const auth = require('./auth');
const blog = require('./blog');

const api = new Router();

api.use('/auth', auth.routes());
api.use('/blog', blog.routes());

module.exports = api;
