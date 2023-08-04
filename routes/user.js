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
    const user = await User.find().select('-password');
    res.status(200).send(user);
});

router.post('/', async(req,res)=>{
    const error = []
    const{name, emailId, password, mobileNo, bio}= req.body;
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
       bio
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
        User.findOne({emailId: req.body.emailId})
        .then(data => {
            if(data.length){
                const hashPassword = data[0].password;
                bcrypt.compare(password, hashPassword).then(result =>{
                    if(result){
                        res.json({message: "login successful"});
                    }else{
                        res.json({status: "Failed", message: "invalid password"})
                    }
                })
                .catch(err =>{
                      res.json({message: "error occured while comparing password"})
                })
            }else{
                res.json({message: "invalid details entered"});
            }
        })
        .catch(err => {
            res.json({status: "failed", message: "error while checking for existing user"})
        })
    }
    
    
    // let exUser;
    //  try{
    //     exUser= await User.findOne({emailId: req.body.emailId});
    //  }
    //  catch(err){
    //     return console.log(err);
    //  }
    //  if(!exUser){
    //     return res.status(404).send('error occured');
    //  }

    //  const isPwCrt = bcrypt.compareSync(password, exUser.password);
    //  if(!isPwCrt){
    //     return res.status(400).json({message: 'incorrect password'});
    //  }
    //  return res.status(200).json({message:'correct password'});
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
    if (!user) {
        res.status(404).send('The email address does not exist.');
        return;
      }
      const resetPasswordLink = await sendPasswordMail(user);
      res.status(200).send({ resetPasswordLink });
    });
    // if (user){
    //     const randomString = randomstring.generate();
    //     const data = await User.updateOne({emailId: emailId},{$set:{token:randomString}});

    //     sendPasswordMail(user.name, user.emailId, randomString);
    //     res.status(200);
    // }
    // else{
    //     res.status(404);
    // }
    // const resetToken = user.createToken();
    // console.log(resetToken);
    // await user.save();

 //});

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