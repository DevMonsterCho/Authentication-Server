const Router = require("koa-router");
const auth = require("./auth");
const blog = require("./blog");
const file = require("./file");
const kakao = require("./kakao");

const api = new Router();

api.use("/auth", auth.routes());
api.use("/blog", blog.routes());
api.use("/file", file.routes());
api.use("/kakao", kakao.routes());

module.exports = api;
