const {User, validate} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('json-web-token');
const auth = require('../mw/auth');
const crypto = require('crypto');

router.get('/me',auth, async(req,res)=>{
    const user = await User.findById(req.body.user_id);
})

router.get('/', async(req,res)=>{
    res.send("hello");
});

router.post('/', async(req,res)=>{
    const e = validate(req.body);
    if (e) return res.status(400).send(e.message);
    
    let user = await User.findOne({emailId: req.body.emailId});
    if(user) return res.status(400).send('already registered.');

    user = new User({
        name: req.body.name,
        mobileNo: req.body.mobileNo,
        emailId: req.body.emailId,
        password: req.body.password,
        bio: req.body.bio
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    user = await user.save();
    res.send(user);
});

router.put('/:id', async(req,res)=>{
    const e = validate(req.body);
    if (e) return res.status(400).send(e.message);
    const user = await User.findByIdAndUpdate(req.params.id ,{
        name: req.body.name,
        bio: req.body.bio
    }, {new: true});
    if(!user) return res.status(404).send('invalid id or something is missing');
    res.send(user);
})

router.post('/forget-password', async (req, res, next) => {
    const user = await User.findOne({emailId: req.body.emailID});
    if(!user){
        return res.send('there is no such user');
    }
    const token = jwt.sign({_id: user_id}, {expiresIn: '15m'});
    return user.updateOne({forgotPassword: token}, function(err, user){
        if(err){
            return res.status(404).json({error: "error occured"});
        }
        else res.status(200);
    })
  });

//   router.post('/forget-password', async (req, res, next) => {
//     const user = await User.findOne({emailId: req.body.emailId});
//     if (!user){
//         const error = new CustomError('can not find user',404);
//         next(error);
//     }
//     const resetToken = user.createPaToken();
//     await user.save();

//   });

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