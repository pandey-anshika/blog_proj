const {User, validate, createToken} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('json-web-token');
const auth = require('../mw/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const { config } = require('process');
const { options } = require('joi');
const {Blogs} = require('../models/blogs'); 

const sendPasswordMail = async(name, email ,token)=>{
    try {
        const transporter = nodemailer.createTransport({
            host: 'ldksjh@gmail.com',
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
    //res.send("hello");
    const user = await User.find();
    res.send(user);
});

router.post('/', async(req,res)=>{
    // const e = validate(req.body);
    // if (e) return res.status(400).send(e.message);
    
    // let user = await User.findOne({emailId: req.body.emailId});
    // if(user) return res.status(400).send('already registered.');

    // user = new User({
    //     name: req.body.name,
    //     mobileNo: req.body.mobileNo,
    //     emailId: req.body.emailId,
    //     password: req.body.password,
    //     bio: req.body.bio
    // });
    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(user.password, salt);

    // user = await user.save();
    // res.send(user);
    const{name, emailId, password, mobileNo, bio}= req.body;
    let exUser;
    try{
       exUser= await User.findOne({emailId:req.body.emailId});
    }
    catch(err){
       return console.log(err);
    }
    if(exUser){
       return res.status(400).send('error occured');
    }
    const salt = await bcrypt.genSalt(10);
     //user.password = await bcrypt.hash(user.password, salt);
    const hashPassword = bcrypt.hashSync(password, salt);
    const user = new User({
       name,
       password: hashPassword,
       emailId,
       mobileNo,
       bio,
       blogs: [],
    });

    try {
       await user.save();
    } catch (err) {
       return console.log(err);
    }
    return res.status(201);
});

router.post('/login',async(req,res)=>{
    const { password} = req.body;
    let exUser;
     try{
        exUser= await User.findOne({emailId: req.body.emailId});
     }
     catch(err){
        return console.log(err);
     }
     if(!exUser){
        return res.status(404).send('error occured');
     }
     const isPwCrt = bcrypt.compareSync(password, exUser.password);
     if(!isPwCrt){
        return res.status(400).json({message: 'incorrect password'});
     }
     return res.status(200);
    });

router.put('/:id', async(req,res)=>{
    const {name, bio} = req.body;
    //if (e) return res.status(400).send(e.message);
    // const user = await User.findByIdAndUpdate(req.params.id ,{
    //     name: req.body.name,
    //     bio: req.body.bio
    // }, {new: true});
    // if(!user) return res.status(404).send('invalid id or something is missing');
    // res.send(user);
    const id = new mongoose.Types.ObjectId(req.params.id) ;
    console.log(id,"id")
    let user;
    try {
        user = await User.findOneAndUpdate({_id : id }, {
            bio,
            name
        },{new:true});
        console.log(user,"user")
        if(!user){
            return res.status(500);
        }
        return res.status(200).send(user);

    } catch (error) {
        return console.log(error);
    }
   
})

// router.post('/forget-password', async (req, res, next) => {
//     const user = await User.findOne({emailId: req.body.emailID});
//     if(!user){
//         return res.send('there is no such user');
//     }
//     const token = jwt.sign({_id: user_id}, {expiresIn: '15m'});
//     return user.updateOne({forgotPassword: token}, function(err, user){
//         if(err){
//             return res.status(404).json({error: "error occured"});
//         }
//         else res.status(200);
//     })
//   });

  router.post('/forget-password', async (req, res, next) => {
    const user = await User.findOne({emailId: req.body.emailId});
    if (user){
        const randomString = randomstring.generate();
        const data = await User.updateOne({emailId: emailId},{$set:{token:randomString}});

        sendPasswordMail(user.name, user.emailId, randomString);
        res.status(200);
    }
    else{
        // const error = new CustomError('can not find user',404);
        // next(error);
        res.status(404);
    }
    const resetToken = user.createToken();
    console.log(resetToken);
    await user.save();

  });

  router.post('/reset-password', async (req,res,next)=>{
    
        const passwordResetToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
        const user = await User.findOne({passwordResetToken});
          if(!user){
            return next(new ErrorResponse('invalid token',400));
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          await user.save();

  });
 
module.exports = router; 