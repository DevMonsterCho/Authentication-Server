const mongoose = require("mongoose");

const { Schema } = mongoose;

const User = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  oauth: {
    kakao: {
      id: String,
      access_token: String,
      refresh_token: String,
      expires_in: Date,
      refresh_token_expires_in: Date
    }
  },
  createDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", User);
