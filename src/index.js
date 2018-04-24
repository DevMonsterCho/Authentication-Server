require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const bodyparser = require('koa-bodyparser');
const session = require('koa-session');
const redisStore = require('koa-redis');
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

/** Router */
router.get('/', (ctx) => {
    ctx.body = '홈 테스트';
});

/** MiddleWare */
app.use((ctx, next) => {
    console.log(ctx.origin);
    const allowedHosts = [
        'authentication.dmcho.com',
        'ec2-13-125-22-26.ap-northeast-2.compute.amazonaws.com'
    ];
    const origin = ctx.origin;
    console.log('origin : ', origin);
    allowedHosts.every(el => {
        if(!origin) return false;

        console.log(`origin.indexOf(el) !== -1`)
        console.log(origin.indexOf(el), origin.indexOf(el) !== -1);

        if(origin.indexOf(el) !== -1) {
            console.log(origin.indexOf(el))
            ctx.response.set('Access-Control-Allow-Origin', ctx.header.origin);
            return false;
        }
        return true;
    });

    ctx.response.set('Access-Control-Allow-Credentials', true);
    ctx.response.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    return next();
})
app.use(bodyparser());

const client = new redisStore();
// initialize session
app.keys = new KeyGrip([`im a newer secret`, `i like tddfurtle`], 'sha256');

app.use(session({
    key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: (1000 * 60 * 1) * 60 * 24,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: false, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: true, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    store: client
}, app));

app.use( async (ctx, next) => {
    ctx.cache = client;
    console.log(ctx.request)
    console.log(`@@@@@@@@@@@@@@@@@@@@@@@@@`)

    await next();
});

app.use( async (ctx, next) => {
    let sess = ctx.cookies.get('koa:sess');
    console.log(`sess : `, sess);
    let user = {
        email: null,
        name: 'guest'
    }
    if (!sess) {
        ctx.user = user;
        console.log(`ctx.session : `, null);
        return next();
    } else {
        sessUser = await ctx.cache.get(sess);
        if(sessUser) {
            user = sessUser;
            ctx.session = null;
            // await ctx.cookies.set('koa:sess', null);
            console.log(sessUser);
            ctx.session = sessUser;
        }else {
            console.log(`sess : (before destroy)`, sess);
            // await ctx.cache.destroy(sess);
            ctx.session = null;
            await ctx.cookies.set('koa:sess', null);
        }
        ctx.user = user;
        let time = new Date(user._expire);
        console.log(`ctx.session : `, ctx.user);
        console.log(`time : `, time)
    }
    return next();
});

app.use( async (ctx, next) => {
    console.log(ctx.request.body);
    console.log(`@@@@@@@@@@ end @@@@@@@@@@`)
    await next();
})

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

