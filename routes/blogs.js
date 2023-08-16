const {Blogs, validate} = require('../models/blogs'); 
const auth = require('../mw/auth');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const {User}= require('../models/user');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
  const blogs = await Blogs.find().sort( {createdAt : 1} ).select({title:1});
  res.send(blogs);
});

router.post('/', auth,async (req, res) => {
  const error = [];
  const {title, desc, shortDes, createdBy, Tags}= req.body;
  if (!title){
      error.push({error:'title missing', errorType: 'validation'})
  }
  if (!desc){
      error.push({error:'desc missing', errorType: 'validation'})
  }

  if (!shortDes){
      error.push({error:'short description missing', errorType: 'validation'})
  }
  if(createdBy){
    let user = null ;
    try{
      user = await User.findOne({name:createdBy});
    }
    catch(err){
      console.log(err);
      return res.status(500).send('something went wrong');
    }
    if(!user){
      error.push({error:'user not found', errorType: 'validation'})
    }
  }
  if(Tags){
    let tags = Tags.toString().split(',');
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i].trim();
        if (!tag){
            error.push({error:'tag missing', errorType: 'validation'})
        }
    }
}

  console.log("error:: ",error)
  if (error.length){
      return res.status(400).send(error);
  }

  try{
     const alBlog= await User.findOne({name:req.body.name});
     if(alBlog){
      return res.status(400).send('already existed');
   }
  }
  catch(err){
    console.log(err);
    return res.status(500).send('something went wrong');
  }
  
    const blog = new Blogs({
        title,
        desc,
        shortDes,
        createdAt: req.body.createdAt,
        createdBy,
        updatedAt: req.body.updatedAt,
        Tags
    });
    try {
      const newBlog = await blog.save();
      return res.status(201).send(newBlog);
   } catch (err) {
      return res.status(500).send(err.message);
   }
  
});

router.put('/:id',auth, async (req, res) => {
  const error = [];
  const {title, desc}= req.body;
  if (!title){
    error.push({error:'title missing', errorType: 'validation'})
}
if (!desc){
    error.push({error:'description missing', errorType: 'validation'})
}
console.log("error:: ",error)
if (error.length){
    return res.status(400).send(error);
}

  const id = new mongoose.Types.ObjectId(req.params.id) ;

    try {
        const blog = await Blogs.findOneAndUpdate({_id: id}, {
            title,
            desc
        },{new: true});
        res.send(blog);
        if(!blog){
          return res.status(500).json({message: "something is missing"});
      }
      return res.status(200).send(blog);
    } catch (error) {
        return console.log(error.message);
    }
});

router.delete('/:id',auth, async (req, res) => {
  const id = new mongoose.Types.ObjectId(req.params.id) ;
  const blog = await Blogs.findOneAndDelete({_id: id});
  
  if (!blog) {
    return res.status(404).json({message: "blog does'nt exist with this id"});
  };
  return res.status(200).send(blog);
  
});

router.get('/:id',auth, async (req, res) => {
  const blog = await Blogs.findById(req.params.id);

  if (!blog) return res.status(404).send('The blog was not found.');

  res.send(blog);
});

module.exports = router; 