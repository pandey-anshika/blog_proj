const Joi = require('joi');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

router.get('/', async(req,res)=>{
  res.send("hello");
});

router.post('/', async (req, res) => {
  // const { error } = validate(req.body); 
  // if (error) return res.status(400).send(error.message);

  let user = await User.findOne({ emailId: req.body.emailId });
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  res.send(user);
});

// function validate(req) {
//   const schema = Joi.object({
//     emailId: Joi.string().required().email(),
//     password: Joi.string().min(8).max(20).required()
//   });

//   // return Joi.validate(req, schema);
//   schema.validate(req);
// }

module.exports = router; 
