const {Blogs, validate} = require('../models/blogs'); 
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const {User}= require('../models/user');

router.get('/', async (req, res) => {
  const blogs = await Blogs.find().sort( {createdAt : 1} ).select({title:1});
  res.send(blogs);
});

// router.get('/:id', async(req,res)=>{
//   const blogs = await Blogs.find().select(createdBy);
//   res.send(blogs);
// });


router.post('/', async (req, res) => {
  // const { error } = validate(req.body); 
  // if (error) return res.status(400).send(error.message);

  // const blog = new Blogs({ 
  //   title: req.body.title,
  //   desc: req.body.desc,
  //   shortDes: req.body.shortDes,
  //   createdBy: req.body.createdBy,
  //   createdAt: req.body.createdAt,
  //   updatedBy: req.body.updatedBy
  // });
  // blog = await blog.save();
  // res.send(blog);
  //const {title, shortDes, desc, createdBy, createdAt, updatedAt, id}= req.body;
  let exUser;
  try{
     exUser= await User.findOne({name:req.body.name});
  }
  catch(err){
     return console.log(err);
  }
  if(exUser){
     return res.status(400).send('error occured');
  }
    const blog = new Blogs({
        title: req.body.title,
        desc: req.body.desc,
        shortDes: req.body.shortDes,
        createdAt: req.body.createdAt,
        createdBy:req.body.createdBy,
        updatedAt: req.body.updatedAt,
        id: req.body.id
    });
    try {
      await blog.save();
   } catch (err) {
      return console.log(err);
   }
   return res.status(201);
    
});

router.put('/:id', async (req, res) => {
  // const { error } = validate(req.body); 
  // if (error) return res.status(400).send(error.message);

  // const blog = await Blogs.findByIdAndUpdate(req.params.id,
  //   { 
  //     title: req.body.title,
  //     desc: req.body.desc,
  //     shortDes: req.body.shortDes,
  //     tags: req.body.tags
  //   }, { new: true });

  // if (!blog) return res.status(404).send('blog was not found.');
  
  // res.send(blog);
  const {title, desc}= req.body;
    let blog;
    try {
        blog = await Blogs.findOneAndUpdate({id: req.params.id}, {
            title,
            desc
        },{new: true});
        res.send("done");
    } catch (error) {
        return console.log(error);
    }
    if(!blog){
        return res.status(500);
    }
    return res.status(200);
});

router.delete('/:id', async (req, res) => {
  const blog = await Blogs.findOneAndDelete({id: req.params.id});

  if (!blog) return res.status(404);

  res.send(blog);
});

router.get('/:id', async (req, res) => {
  const blog = await Blogs.findById(req.params.id);

  if (!blog) return res.status(404).send('The blog was not found.');

  res.send(blog);
});

module.exports = router; 