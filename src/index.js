require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const session = require('koa-session');
const redisStore = require('koa-redis');
const passport = require('koa-passport');
const mongoose = require('mongoose');
const KeyGrip = require('keygrip');

/** Module */
const api = require('./api');

const {
    PORT: port = 4000,
    MONGO_URI: mongoURI,
} = process.env;

/** Database Connection */
mongoose.Promise = global.Promise;
mongoose.connect(mongoURI).then(() => {
    console.log('connected to mongodb');
}).catch((e) => {
    console.error(e);
})

/** Application */
const app = new Koa();
const router = new Router();
// const client = redisStore();

/** Router */
router.get('/', (ctx) => {
    ctx.body = '홈 테스트';
});

/** MiddleWare */
app.use(bodyparser());

let count = 0;
// initialize session
app.keys = new KeyGrip(['im a newer secret', 'i like tddfurtle'], 'sha256');
const CONFIG = {
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 1000 * 60 * 5,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    store: redisStore(),
};
app.use(session(CONFIG, app));
app.use((ctx, next) => {
    let sess = ctx.cookies.get('koa:sess');
    console.log(`sess : `, sess);
    if (!sess) {
        return next();
    } else {
        console.log(`ctx.session : `, ctx.session);
    }
    return next();
});

router.use('/api', api.routes());
app.use(router.routes()).use(router.allowedMethods());

/** Listener */
app.listen(port, () => {
    console.log(`Koa is running at ${port} port`)
})


const crypto = require('crypto');

const cryptoPbkdf2Sync = (password) => {
    let key = crypto.pbkdf2Sync(password, 'salt', 100000, 64, 'sha512');
    return key.toString('base64');
}