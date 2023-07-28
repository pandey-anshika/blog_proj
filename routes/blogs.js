const Blogs = require('../models/blogs'); 
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const blogs = await blog.find().sort( {createdAt : 1} ).select({title:1});
  res.send(blogs);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.message);

  const blog = new Blogs({ 
    title: req.body.title,
    desc: req.body.desc,
    shortDes: req.body.shortDes,
    createdBy: req.body.createdBy,
    createdAt: req.body.createdAt,
    updatedBy: req.body.updatedBy
  });
  blog = await blog.save();
  res.send(blog);
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.message);

  const blog = await Blogs.findByIdAndUpdate(req.params.id,
    { 
      title: req.body.title,
      desc: req.body.desc,
      shortDes: req.body.shortDes
    }, { new: true });

  if (!blog) return res.status(404).send('blog was not found.');
  
  res.send(blog);
});

router.delete('/:id', async (req, res) => {
  const blog = await Blogs.findByIdAndRemove(req.params.id);

  if (!blog) return res.status(404);

  res.send(blog);
});

router.get('/:id', async (req, res) => {
  const blog = await Blogs.findById(req.params.id);

  if (!blog) return res.status(404).send('The blog was not found.');

  res.send(blog);
});

module.exports = router; 