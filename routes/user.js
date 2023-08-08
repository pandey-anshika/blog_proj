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

const sendPasswordMail = async(name, email ,token)=>{
    try {
        const transporter = nodemailer.createTransport({
            host: 'ldksjh@gmail.com',
            service: 'gmail',
            port: 234,
            secure: false,
            requireTLS: true,
            auth:{
                user:config.emailId ,
                pass:config.password
            }
        });

        const mailOptions = {
            from: config.emailId,
            to: email,
            subject: 'resetting password',
            text: options.message
        }
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }
            else{
                console.log(info.response);
            }
        })
    } catch (error) {
        res.status(400);
    }
}

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
        await User.findOne({emailId: req.body.emailId})
        .then(data => {
            if(Object.keys(data).length){
                const hashPassword = data.password;
                bcrypt.compare(password, hashPassword).then(async(result) =>{
                    if(result){
                        var tokenAuth = jwt.sign({_id: data._id, Date:new Date()},'jwtPrivateKey');
                        res.json({message: "login successful", key:tokenAuth});
                        const t = new tokenSchema({
                            emailID: data._id,
                            token: tokenAuth
                         });
                       await t.save();
                    }else{
                        res.json({status: "Failed", message: "invalid password"});
                    }
                })
                .catch(err =>{
                      res.json({message: "error occured while comparing password"});
                })
            }else{
                res.json({message: "invalid details entered"});
            }
        })
        .catch(err => {
            res.json({status: "failed", message: "error while checking for existing user"});
        })
    }
    });

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
//     const token = jwt.sign({_id: user_id}, {expiresIn: '15m'});
//     return user.updateOne({forgotPassword: token}, function(err, user){
//         if(err)    return res.status(404).json({error: "error occured"});

  router.post('/forget-password', async (req, res, next) => {
    const {emailId} = req.body;
    if(emailId){
        const user = await User.findOne({emailId: req.body.emailId});
        if(user){
            const key = user._id + "secertkey";
            const token = jwt.sign({user: user._id},key ,{
                expiresIn: '5m',
            })
            sendPasswordMail(user.name, user.emailId, token.token);
            return res.status(200).json({message: 'message sent'});
        }
        else{
            return res.send('there is no such user');
        }
    }
    else{
        return res.status(400).send('provide valid email!');
    }

  });
    
  router.post('/reset-password', async (req,res,next)=>{
    const {emailId,password, newPassword, confirmPassword} = req.body;
     const {token,id}=req.params;
    if(emailId){
        const user = await User.findOne({emailId: req.body.emailId});
        if(user){
            try {
                if(!password == newPassword){
                 if(newPassword & confirmPassword & id & token){
                    if(newPassword === confirmPassword){
                        const key = user._id + `secertkey`; 
                        const isValid = await jwt.verify(token, key);
                        if(isValid){
                            const userr = await User.findOneAndUpdate({_id : id});
                            const genSalt = await bcrypt.genSalt(10);
                            const hashPassword = await bcrypt.hash(newPassword, genSalt);
                            const isSuccess = await User.findByIdAndUpdate(userr, {
                                $set:{
                                    password: hashPassword,                           
                                },
                            });
                            if(isSuccess){
                                return res.status(200).json({message: "Password changed"});
                            }
                        }
                        else{
                            return res.status(400).json({message: 'link expired'});
                        }
                    }else{
                        return res.status(400).json({message: "both the password does'nt match"});
                    }
                } 
            }else{
                return res.status(400).json({message: " give different password"});
            }    
            } catch (error) {
                return res.status(400).json({message: error.message});
            
        }
        }
    }else{
        return res.status(400).send('provide valid email')
    }
    
  });
        
  
module.exports = router; 