const mongoose = require('mongoose');

const { Schema } = mongoose;

const Blog = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    md: {
        type: String,
    },
    files: {
        type: Array,
    },
    createDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Blog', Blog);