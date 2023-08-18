const express = require('express');
const config = require('config');
const Joi = require('joi');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const app = express();
const blogs = require('./routes/blogs');
const user = require('./routes/user');
const auth = require('./mw/auth');
const {mw} = require('./mw/middleware');
const bodyParser = require('body-parser');
const catg = require('./routes/catg');


if(!config.get('jwtPrivateKey')){
  console.error('fatal error');
  process.exit(1);
}

mongoose.connect('mongodb://127.0.0.1:27017/newwprod')
.then((res)=> console.log('connected to mongodb::'))
.catch(err=> console.log('could not connect to mongodb' , err));
  
app.use(bodyParser.json()).use(bodyParser.urlencoded({
  extended:true
}))
app.use(express.json());
app.use('/api/blogs',blogs);
app.use('/api/user',user);
app.use('/api/catg', catg);
app.use(mw);
app.set('view engine', 'ejs');


var storage = multer.diskStorage({

    destination: function (req, file, cb) {
 
       cb(null, 'uploads');
     },
     filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
     }
  });
  var upload = multer({ storage: storage });
 
  app.post('/api/upload', upload.single('image'),(req, res) => {
    const image = req.image;
    // res.send(image);
      res.send(apiResponse({message: 'File uploaded successfully.', image}));
  });
 
  function apiResponse(results){
      return JSON.stringify({"status": 200, "response": results});
  }

const port = process.env.PORT || 3000;
app.listen(port, ()=>{console.log('listening...'); });