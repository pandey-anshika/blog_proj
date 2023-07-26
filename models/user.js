const Joi = require('joi');
const mongoose = require('mongoose');

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
    maxlength: 20
  },
  mobileNo: {
    type: Number,
    required: true
  },
  emailId: String,
  bio:{
    type: String,
    minlength: 3,
    maxlength: 100
  }
}));

function validateUser(user) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    password: Joi.string().min(8).max(20).required(),
    emailId: Joi.string(),
    bio: Joi.string().min(3).max(100),
    mobileNo: Joi.number().required()
  };

  return Joi.validate(user, schema);
}

exports.User = User; 