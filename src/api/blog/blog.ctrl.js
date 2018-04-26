const Blog = require('models/blog');
const { ObjectId } = require('mongoose').Types;
const fs = require('fs');
const os = require('os');
const path = require('path');

exports.write = async (ctx) => {
    console.log(`######## blog write #######`);
    console.log(ctx.request.body);
    console.log(ctx.user);
    // if(!ctx.user.email) {
    //     ctx.status = 401;
    //     ctx.body = '로그인 후 이용 가능합니다.';
    // }
    const { email, name, title, text, md, files } = ctx.request.body;
    const blog = new Blog({
        email,
        name,
        title,
        text,
        md,
        files,
    });

    console.log(blog);
    try {
        await blog.save();
        ctx.body = {
            blog: blog
        };

    } catch (e) {
        ctx.throw(e, 500);
    }
    console.log(`write`);
}

exports.delete = async (ctx) => {
    const { id } = ctx.params;
    const user = ctx.user;
    if(!user.email) {
        ctx.status = 401;
        ctx.body = '로그인 후 이용 가능합니다.'
    }
    try {
        let blog = await Blog.find({email: user.email})
                             .findByIdAndRemove(id).exec();
        ctx.body = "삭제되었습니다."
    } catch (e) {
        return ctx.throw(e, 500);
    }
}

exports.listAll = async (ctx) => {
    try {
        const blogs = await Blog.find().exec();
        ctx.body = {
            list: blogs
        };
    } catch (e) {
        ctx.throw(e, 500);
    }
}

exports.listUser = async (ctx) => {
    const { useremail } = ctx.request.params;
    try {
        const blogs = await Blog.find({email: useremail}).exec();
        ctx.body = blogs;
    } catch (e) {
        ctx.throw(e, 500);
    }
}

exports.checkObjectId = (ctx, next) => {
    const { id } = ctx.params;
    if (!ObjectId.isValid(id)) {
        ctx.status = 400;
        return null;
    }

    return next();
}
