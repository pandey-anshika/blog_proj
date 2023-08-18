const {Blogs, validate} = require('../models/blogs'); 
const auth = require('../mw/auth');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const {User}= require('../models/user');
const jwt = require('jsonwebtoken');
const {Category, validateUser} = require('../models/category')

router.get('/', async (req, res) => {
const blogs = await Blogs.find().sort( {createdAt : -1} );
  res.send(blogs);
});

router.post('/', auth,async (req, res) => {
  const {user_id} = req.User;
  const error = [];
  const {title, desc, shortDes, Tags, category}= req.body;
  if (!title){
      error.push({error:'title missing', errorType: 'validation'})
  }
  if (!desc){
      error.push({error:'desc missing', errorType: 'validation'})
  }

  if (!shortDes){
      error.push({error:'short description missing', errorType: 'validation'})
  }

  if(!category){
    error.push({error:"Category is required", errorType :"Validation"})
  }else{
    let cat=await Category.findOne({'name':category});
    if(!cat){
      error.push({error:`You are not authorized to add blog in ${category}`, errorType :"Authorization"});
  }
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
        Tags,
        category,
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
  const blog = await Blogs.findById(req.params.id).populate('createdBy').populate('category','title');

  if (!blog) return res.status(404).send('The blog was not found.');

  res.send(blog);
});

router.post('/:blogId/comments',auth, async(req,res)=>{
  const {user_id} = req.User;
  const error = [];
  const {content}= req.body;
  if (!content){
      error.push({error:'comment missing', errorType: 'validation'})
  }

  console.log("error:: ",error)
  if (error.length){
      return res.status(400).send(error);
  }

  const comment = {
    content,
    createdAt: Date.now(),
    userId: user_id
  }

  const id =new mongoose.Types.ObjectId( req.params.blogId) ;
  const blog =await Blogs.findOne({_id: id});
    if(!blog){
      return res.status(400).json({message: "Blog not found"});
      }
     else{
      blog.Comments.push(comment);
      blog.save();
      return res.status(201).send(blog);
     }
  })

router.put('/:blogId/comments/:commentId',auth, async(req,res)=>{
  const {user_id} = req.User;
  const {blogId, commentId} = req.params  ;
  const error = [];
  const {content}= req.body;
  if (!commentId){
      error.push({error:'comment missing', errorType: 'validation'})
  }
  if (!content){
    error.push({error:'content missing', errorType: 'validation'})
    }
  console.log("error:: ",error);
  if (error.length){
      return res.status(400).send(error);
  }

  const blog = await Blogs.findById(new mongoose.Types.ObjectId(blogId))
  if(!blog){
    return res.status(400).json({message: "blogId is missing"});
  }
  const comment = blog.Comments.id(new mongoose.Types.ObjectId(commentId))
  if(!comment){
    return res.status(400).json({message: "comment is missingwith this Id"});
  }else{
    comment.content = content;
    comment.updatedAt = Date.now();
    blog.save();
    return res.status(200).send(comment);
  }
  
})

router.delete('/:blogId/comments/:commentId',auth, async(req,res)=>{
  const {blogId, commentId} = req.params  ;
  const blog = await Blogs.findById(new mongoose.Types.ObjectId(blogId))
  if(!blog){
    return res.status(400).json({message: "blog is missing with this id"});
  }
  const comment = blog.Comments.id(new mongoose.Types.ObjectId(commentId))
  if(!comment){
    return res.status(400).json({message: "comment is missingwith this Id"});
  }else{
    blog.Comments.pull(comment);
    blog.save();
    return res.status(200).send(comment);
  }

})
module.exports = router;  