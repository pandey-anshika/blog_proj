const express = require('express');
const config = require('config');
const Joi = require('joi');
const { default: mongoose } = require('mongoose');
const app = express();
const blogs = require('./routes/blogs');
const user = require('./routes/user');
const {mw} = require('./middleware');

mongoose.connect('mongodb://127.0.0.1:27017/newwprod')
.then((res)=> console.log('connected to mongodb::'))
.catch(err=> console.log('could not connect to mongodb' , err));
  
app.use(express.json());
app.use('/api/blogs',blogs);
app.use('/api/user',user);
app.use(mw);

const port = process.env.PORT || 3000;
app.listen(port, ()=>{console.log('listening...'); });