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
        return res.status(200).send({message: "Empty credentials"});
    }else{
        const user = await User.findOne({emailId: req.body.emailId});
        if(user&&(await bcrypt.compare(password, user.password))){
         const token =  jwt.sign({user_id: user._id, emailId},'jwtPrivateKey');
         user.token = token;  
         return res.status(200).send(user);
        }
        return res.status(400).send('invalid credentials');
    }
});

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
        return res.status(500).send('something went wrong');
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


router.post('/forget-password-link',async(req,res,next)=>{
    const {emailId} = req.body;
    
        const user =await  User.findOne({ emailId: emailId });
        if(user){
            const payload={
                emailId: user.emailId,
                user_id: user._id
            };
            const token = jwt.sign(payload,'jwtPrivateKey',{expiresIn:'15m'});
            try{
                const user = await User.updateOne({emailId: payload.emailId},{
                        $set:{
                            passwordResetToken: token
                        }    
                });
            }catch(e){
                return res.status(500).send('something went wrong');
            }
            const link = `http://localhost:3000/api/user/reset-password-link/${user._id}/${token}`;
            console.log(link);
            res.send('password reset link has been sent');
        }
        else{
            return res.status(400).send('User not registered');
        }
    

})

router.get('/reset-password-link/:id/:token', async(req,res,next)=>{
    const {id,token} = req.params;
   
    const user = await User.findOne({_id: id});
    console.log("users::",user)
     if(user.passwordResetToken){
        const payload = jwt.verify(token, 'jwtPrivateKey',(err, decoded) => {
            if(err){
              res.send(err.message)
            }else{
                res.render('reset-password');
            }
          });
            }else{
                res.send('token doesnt exists');
                
            }
})

router.post('/reset-password-link/:id/:token',async (req,res,next)=>{
    
    const {token,id} = req.params;
    const {newPassword,confirmPassword} = req.body;

    const user = await User.findOne({_id: id});
    if(user.passwordResetToken){
        const payload = jwt.verify(token, 'jwtPrivateKey');
    
            if(newPassword == confirmPassword){
                const genSalt = await bcrypt.genSalt(10);
                const newHashPassword = await bcrypt.hash(confirmPassword, genSalt);

                try {
                    const updatedUser = await User.updateOne({emailId: payload.emailId},{
                        $unset:{
                            passwordResetToken:''
                        },
                            $set:{
                                password: newHashPassword
                            }    
                    },{new: true});
                    return res.status(200).send(updatedUser);
            } catch (error) {
                return res.status(400).send('not updated');
            }
            }
            else{
                return res.status(400).send('passwords do not match');
                }
    }else{
        res.send('token doesnt exists');
        
    }
    
            
})

router.post('/reset-password', auth,async (req,res,next)=>{
    const {emailId} = req.User;
        const { password, newPassword} = req.body;
        if(emailId ){
            const user = await User.findOne({emailId:emailId});
            console.log(user.password)
            if(user){     
                const comparePassword =await bcrypt.compare(password, user.password);
                console.log(comparePassword)
                if(!comparePassword){
                    return res.status(400).send({error:"Wrong old password"})
                }

                const genSalt = await bcrypt.genSalt(10);
                const newhashPassword = await bcrypt.hash(newPassword, genSalt);

                console.log(newhashPassword)
                console.log(user.password)
                console.log("user.password !== newhashPassword",user.password !== newhashPassword)
                try {
                    if(user.password !== newhashPassword){
                            const isSuccess = await User.updateOne({emailId:emailId}, {
                                $set:{
                                    password: newhashPassword,                           
                                }
                            });
                            if(isSuccess){
                                return res.status(200).json({message: "Password changed"});
                           }
                            else{
                                 return res.status(500).send('password not change');
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