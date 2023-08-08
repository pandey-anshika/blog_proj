const {User, validate, createToken} = require('../models/user');
const mongoose = require('mongoose');
const Token = require('../models/token');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const auth = require('../mw/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const { config } = require('process');
const { options } = require('joi');
const {Blogs} = require('../models/blogs'); 
const {tokenSchema, validateToken} = require('../models/token'); 

router.get('/', async(req,res)=>{
    const user = await User.find().select('-password');
    res.status(200).send(user);
});

router.post('/', async(req,res)=>{
    const error = []
    const{name, emailId, password, mobileNo, bio, Tags}= req.body;
    if (!name){
        error.push({error:'name missing', errorType: 'validation'})
    }
    if (!emailId){
        error.push({error:'emailId missing', errorType: 'validation'})
    }

    if (!password){
        error.push({error:'password missing', errorType: 'validation'})
    }

    if (!mobileNo){
        error.push({error:'mobileNo missing', errorType: 'validation'})
    }
    if(Tags){
        const tags = Tags.split(',');
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i].trim();
            if (!tag){
                error.push({error:'tag missing', errorType: 'validation'})
            }
        }
    }
    console.log("error:: ",error)
    if (error.length){
        return res.status(400).send(error)
    }

    try{
       const exUser = await User.findOne({emailId:req.body.emailId});
        if(exUser){
            return res.status(400).send('User already exists');
        }
    }
    catch(err){
       console.log(err);
       return res.status(500).send('Something went wrong')
    }
    

    const salt = await bcrypt.genSalt(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    const user = new User({
       name,
       password: hashPassword,
       emailId,
       mobileNo,
       bio,
       Tags
    });
    const token = jwt.sign({user_id: user._id, emailId},'jwtPrivateKey');
    user.token = token;

    try {
      const newUser =  await user.save();
      
      return res.status(201).send(newUser);

    } catch (err) {
       return res.status(500).send(err.message);
    }

});

router.post('/login',async(req,res)=>{
    const { emailId, password} = req.body;
    if(emailId == "" || password==""){
        res.json({message: "Empty credentials"});
    }else{
        const user = await User.findOne({emailId: req.body.emailId});
        if(user&&(await bcrypt.compare(password, user.password))){
         const token =  jwt.sign({user_id: user._id, emailId},'jwtPrivateKey');
         user.token = token;  
         res.json(user);
        }
        res.send('invalid credentials');
    }
});
    // }else{
    //      const user = await User.findOne({emailId: req.body.emailId})
    //      .then(user => {
    //          if(Object.keys(user).length){
    //              const hashPassword = user.password;
    //              bcrypt.compare(password, hashPassword).then(async(result) =>{
    //                  if(result){
    //                      var tokenAuth = jwt.sign({_id: user._id,emailId ,Date:new Date()},'jwtPrivateKey');
    //                      res.json({message: "login successful", key:tokenAuth});
    //                 //     const t = new tokenSchema({
    //                 //          emailID: user._id,
    //                 //          token: tokenAuth
    //                 //   });
    //                 // await t.save();
    //                  }else{
    //                      res.json({status: "Failed", message: "invalid password"});
    //                  }
    //              })
    //              .catch(err =>{
    //                    res.json({message: "error occured while comparing password"});
    //              })
    //          }else{
    //              res.json({message: "invalid details entered"});
    //         }
    //     })
    //     .catch(err => {
    //         res.json({status: "failed", message: "error while checking for existing user"});
    //     })
    // }
    // });

router.put('/:id', async(req,res)=>{
    const error = [];
    const {name, bio} = req.body;
  if (!name){
      error.push({error:'name missing', errorType: 'validation'})
  }
  if (!bio){
      error.push({error:'bio missing', errorType: 'validation'})
  }
  console.log("error:: ",error)
  if (error.length){
      return res.status(400).send(error);
  }

    const id = new mongoose.Types.ObjectId(req.params.id) ;

    try {
        const user = await User.findOneAndUpdate({_id : id }, {
            bio,
            name
        },{new:true});
        console.log(user,"user");
        if(!user){
            return res.status(500).send('something is missing');
        }
        return res.status(200).send(user);

    } catch (error) {
        return console.log(error.message);
    }
   
});

module.exports = router; 