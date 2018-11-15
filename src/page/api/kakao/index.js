const Router = require("koa-router");
const authCtrl = require("./kakao.ctrl");

const auth = new Router();

// auth.get("/check", authCtrl.check);
// auth.get("/list", authCtrl.list);
// auth.get("/list/:id", authCtrl.checkObjectId, authCtrl.info);
// auth.post("/login", authCtrl.login);
auth.get("/authorize", authCtrl.authorize);
auth.get("/redirect", authCtrl.redirect);
auth.post("/sendmessage", authCtrl.postTalkMessage);

// auth.put("/modify", authCtrl.modify);
// auth.delete("/:id", authCtrl.checkObjectId, authCtrl.remove);

module.exports = auth;
