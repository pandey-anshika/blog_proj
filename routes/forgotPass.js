const express = require('express');
const bcrypt = require('bcrypt');
const {User} = require('../models/user')
const nodemailer = require('nodemailer');
const router = express.Router();

const app = express();

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

app.post('/forget-password', (req, res) => {
  const { email } = req.body;

  const user = User.findOne({ email });
  if (!user) {
    res.status(404).send('User not found');
    return;
  }

  const token = bcrypt.hashSync(Math.random().toString(36), 10);

  user.passwordResetToken = token;
  user.save();

  sendPasswordMail.send(user.name, user.emailId, token.token);

  res.status(200).send('Password reset email sent');
});

app.post('/reset-password', (req, res) => {
  const { token, password } = req.body;

  const user = User.findOne({ passwordResetToken: token });
  if (!user) {
    res.status(400).send('Invalid token');
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  user.password = hashedPassword;
  user.passwordResetToken = null;
  user.save();

  res.status(200).send('Password reset successful');
});

module.exports = router;