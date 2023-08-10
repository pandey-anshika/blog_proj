const {User, validateUser} = require('../models/user');
const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ExcelJs = require('exceljs');
const moment = require('moment');
const _ = require('lodash');
const auth = require('../mw/auth');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const crypto = require('crypto');
const { config } = require('process');
const { options } = require('joi');
const {Blogs} = require('../models/blogs'); 
const { decrypt } = require('dotenv');

const sendPasswordMail = async(name, emailId ,token)=>{
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
            to: emailId,
            subject: 'resetting password',
            text: `
            To reset your password, click the following link
          `
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
       bio,
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

router.put('/:id',auth, async(req,res)=>{
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
        if(!user){
            return res.status(500).send('something is missing');
        }
        return res.status(200).send("details updated");

    } catch (error) {
        return console.log(error.message);
    }
   
});

router.get('/sheet',auth, async(req,res)=>{
    try {
        const user = await User.find();
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('My User');
        worksheet.columns = [
            { header: 'S.no', key: 's_no' },
            { header: 'Name', key: 'name' },
            { header: 'Email Id', key: 'emailId' },
            { header: 'Mobile No', key:'mobileNo' },
            { header: 'Bio', key: 'bio' }
            ];
            let count = 1;
            user.forEach(users=>{
                users.s_no = count;
                worksheet.addRow(users);
                count +=1
            });
            worksheet.getRow(1).eachCell((cell)=>{
                cell.font = {bold:true};
            });
            const data = await workbook.xlsx.writeFile('users.xlsx').then((data)=>{
                res.send('done');
            })
    } catch (error) {
        res.status(500).send(error);
    }

})
router.post('/forget-password', (req, res) => {
    const { emailId } = req.body;
    if (emailId) {
        const user =  User.findOne({ emailId });
           if (!user) {
            let resetToken = crypto.randomBytes(32).toString("hex");
               const salt = bcrypt.genSalt(10)
               const hash = bcrypt.hash(resetToken, salt);
               user.resetPasswordToken = hash;
               user.save();
               sendPasswordMail.send(user.emailId, user.name, user.resetPasswordToken);
               res.status(200).send('Password reset email sent');
           }
           else{
               return res.status(400).send({ error: "User not found" });    
  }
    }
    else{
        return res.status(400).send({ error: "emailId missing" });
 } 
});
  

router.post('/reset-password', auth,async (req,res,next)=>{
    const {emailId} = req.User;
        const { password, newPassword} = req.body;
        if(emailId ){
            const user = await User.findOne({emailId:emailId});
            console.log(user.password)
            if(user){     
                const comparePassword =await bcrypt.compare(password, user.password);
                if(!comparePassword){
                    return res.status(400).send({error:"Wrong old password"})
                }

                const genSalt = await bcrypt.genSalt(10);
                const newhashPassword = await bcrypt.hash(newPassword, genSalt);

                try {
                    if(user.password == newhashPassword){
                            const isSuccess = await User.updateOne({}, {
                                $set:{
                                    password: newhashPassword,                           
                                }
                            });
                            if(isSuccess){
                                return res.status(200).json({message: "Password changed"});
                           }
                            else{
                                 return res.status(400).send('password not change');
                          }
                        }
                        else{
                            return res.status(400).send('old password and new password cannot be same');
                        }
                     }
              
                catch (error) {
                    return res.status(400).json({message: error.message});
            }
        }else{
            return res.status(400).send('provide valid email or password');
        }
    }
      });
module.exports = router; 