const User = require('models/user');
const { ObjectId } = require('mongoose').Types;
const crypto = require('crypto');

const cryptoPbkdf2Sync = (password) => {
    let key = crypto.pbkdf2Sync(password, 'salt', 100000, 64, 'sha512');
    return key.toString('base64');
}

exports.join = async (ctx) => {
    const { name, email, password } = ctx.request.body;
    
    let passkey = cryptoPbkdf2Sync(password);

    const user = new User({
        name, 
        email, 
        password: passkey
    });

    try {
        await user.save();
        
        console.log(`create User : `, {
            _id: user._id,
            name: user.name,
            email: user.email,
        })

        ctx.body = user
    } catch (e) {
        ctx.throw(e, 500);
    }
}


exports.login = async (ctx) => {
    const { email, password } = ctx.request.body;
    if(!email || !password) 
        ctx.status = 400;
    if(!email) return ctx.body = `이메일을 입력하지 않으셨습니다.`;
    if(!password) return ctx.body = `비밀번호를 입력하지 않으셨습니다.`;
    let passkey = cryptoPbkdf2Sync(password);

    try {
        const user = await User.findOne({email}).exec();
        if(passkey === user.password) {
            console.log(user)
            let data = {
                email: user.email,
                name: user.name,
            }
            let mail = user.email;
            console.log(`data ::: `, data);

            let sess = ctx.session = data;

            return ctx.body = user;
        }
        ctx.status = 401;
        if(user) {
            return ctx.body = `이메일 또는 비밀번호가 일치하지 않습니다.`;
        }
    } catch(e) {
        ctx.throw(e, 500);
    }
    
}

exports.logout = (ctx) => {
    ctx.body = "logout";

}

exports.check = (ctx) => {
    ctx.body = "check";

}

exports.info = async (ctx) => {
    const { id } = ctx.params;
    let passkey = cryptoPbkdf2Sync(id);
    try {
        const user = await User.findById(id).exec();


        // ctx.session[passkey] = JSON.stringify({name: user.name, email: user.email});
        // ctx.cookies.set('koa:session', passkey);
        // console.log(ctx.session);
        ctx.body = user;
    } catch (e) {
        ctx.throw(e, 500);
    }
}

exports.list = async (ctx) => {
    try {
        const users = await User.find().exec();
        ctx.body = users;
    } catch (e) {
        ctx.throw(e, 500);
    }
}

exports.remove = async (ctx) => {
    const { id } = ctx.params;
    try {
        await User.findByIdAndRemove(id).exec();
        ctx.body = "삭제되었습니다."
    } catch (e) {
        ctx.throw(e, 500);
    }
}

exports.checkObjectId = (ctx, next) => {
    const { id } = ctx.params;
    if(!ObjectId.isValid(id)) {
        ctx.status = 400;
        return null;
    }

    return next();
}
