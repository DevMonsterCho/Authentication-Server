require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
// const bodyparser = require('koa-bodyparser');
const bodyparser = require('koa-body');
const session = require('koa-session');
const redisStore = require('koa-redis');
const mongoose = require('mongoose');
const KeyGrip = require('keygrip');
const Redis = require('ioredis');
const redis = new Redis(6379,'127.0.0.1')
/** Module */
const page = require('./page');
const path = require('path');

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

/** MiddleWare */
app.use((ctx, next) => {
    // const allowedHosts = [
    //     'dev.authentication.dmcho.com:3000',
    //     'dev.authentication.dmcho.com',
    //     'authentication.dmcho.com',
    //     'ec2-13-125-22-26.ap-northeast-2.compute.amazonaws.com'
    // ];
    // const origin = ctx.origin;
    // allowedHosts.every(el => {
    //     if (!origin) return false;
    //     if (origin.indexOf(el) !== -1) {
    //         console.log(origin.indexOf(el))
    //         ctx.response.set('Access-Control-Allow-Origin', ctx.header.origin);
    //         return false;
    //     }
    //     return true;
    // });
    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.set('Access-Control-Allow-Credentials', true);
    ctx.response.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS, POST, PUT');
    ctx.response.set('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Credentials, Origin, Accept, X-Requested-With, Content-Type, crossDomain, Access-Control-Request-Method, Access-Control-Request-Headers, X-Access-Session, X-Access-Fingerprint');
    return next();
})
app.use(bodyparser({
   formidable:{uploadDir: './uploads'},
   multipart: true,
   urlencoded: true
}));

app.use(async (ctx, next) => {
    ctx.root = path.join(__dirname, '../');
    ctx.src = path.join(__dirname);
    let agent = ctx.request.header['user-agent'];
    let language = ctx.request.header['accept-language'];
    ctx.cache = redis;
    let userData = { email: null, name: 'guest', agent, language };
    let user = {};

    user.session = ctx.request.header['x-access-session'];
    if(user.session) {
        let redisValue = await ctx.cache.get(user.session);
        let parsedRedis = JSON.parse(redisValue);
        if(parsedRedis && parsedRedis.agent === agent && parsedRedis.language === language) ctx.user = parsedRedis
        else ctx.user = userData;
    }else{
        ctx.user = userData;
    }

    // user.session = ctx.cookies.get('dmcho:sess');
    // if(user.session) {
    //     let redusValue = ctx.cache.get(user.session);
    //     let parsedRedis = JSON.parse(redusValue);
    //     if(parsedRedis && parsedRedis.agent === agent && parsedRedis.language === language) ctx.user = parsedRedis
    //     else ctx.user = userData;
    // } else {
    //     ctx.user = userData;
    // }
    await next();
});

router.use(page.routes());
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

