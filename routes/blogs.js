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
  const {user_id} = req.User;
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

  if(!Array.isArray(Tags) && !Tags.length){
    error.push({error:'tags missing', errorType: 'validation'})   
}

  console.log("error:: ",error)
  if (error.length){
      return res.status(400).send(error);
  }

  
    const blog = new Blogs({
        title,
        desc,
        shortDes,
        createdAt: Date.now(),
        createdBy: user_id,
        updatedAt: Date.now(),
        Tags
    });
    try {
      const newBlog = await blog.save();
      return res.status(201).send(newBlog);
   } catch (err) {
      return res.status(500).send('something went wrong');
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
        return res.status(500).send('something went wrong');
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