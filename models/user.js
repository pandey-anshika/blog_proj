const Joi = require('joi');
const mongoose = require('mongoose');
const config = require('config');
const jwt = require('json-web-token');
const crypto = require('crypto');

const User = mongoose.model('User', new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    unique: true
  },
  mobileNo: {
    type: Number,
    required: true
  },
  emailId: {
    type: String,
    unique:true
  },
  bio:{
    type: String,
    minlength: 3,
    maxlength: 100
  },
  passwordResetToken: String,
  Tags:{
    type: Array,
    default: []
  },
  token: {
    type: String
  }
}));
function validateUser(user) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    password: Joi.string().min(8).max(20).required(),
    emailId: Joi.string().required().email(),
    bio: Joi.string().min(3).max(100),
    mobileNo: Joi.number().required(),
    Tags: Joi.array().items(Joi.string().min(3).max(100))
  };

  return Joi.valid(user, schema);
}

exports.User = User; 
exports.validate = validateUser;