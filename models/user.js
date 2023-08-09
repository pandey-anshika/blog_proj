const Joi = require('joi');
const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = mongoose.model('User', new mongoose.Schema({
  name: {
    type: String,
    // required: true,
    minlength: 5,
    maxlength: 50
  },
  password: {
    type: String,
    // required: true,
    minlength: 8,
    unique: true
  },
  mobileNo: {
    type: Number,
    // required: true
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
  token: {
    type: String
  }
}));

// User.methods.generateToken = function(){
//   return new Promise((res,req)=>{
//     jwt.sign({_id: user._id.toString()}, config.get('jwtPrivateKey'),(err,token)=>{
//       if(err){
//         return res.status(500).send({
//           message: 'Internal server error'
//         })
//       }
//   else{
//     res.send();
//   }
// });
// });
// }

function validateUser(user) {
  const schema = {
    name: Joi.string().min(5).max(50),
    password: Joi.string().min(8).max(20),
    emailId: Joi.string().email(),
    bio: Joi.string().min(3).max(100),
    mobileNo: Joi.number()
  };

  return Joi.valid(user, schema);
}

exports.User = User; 
exports.validateUser = validateUser;