const Router = require('koa-router');
const fileCtrl = require('./file.ctrl');

const file = new Router();

file.get('/list', fileCtrl.list);
file.post('/upload', fileCtrl.fileUpload);
file.delete('/delete/:id', fileCtrl.remove);

module.exports = file;