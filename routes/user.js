const {User, validate} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

router.get('/', async(req,res)=>{
    res.send("hello");
});

router.post('/', async(req,res)=>{
    const e = validate(req.body);
    if (e) return res.status(400).send(e.message);
    
    let user = await User.findOne({emailId: req.body.emailId});
    if(user) return res.status(400).send('already registered.');

    user = new User({
        name: req.body.name,
        mobileNo: req.body.mobileNo,
        emailId: req.body.emailId,
        password: req.body.password,
        bio: req.body.bio
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    user = await user.save();
    res.send(user);
});

router.put('/:id', async(req,res)=>{
    const e = validate(req.body);
    if (e) return res.status(400).send(e.message);
    const user = await User.findByIdAndUpdate(req.params.id ,{
        name: req.body.name,
        bio: req.body.bio
    }, {new: true});
    if(!user) return res.status(404).send('invalid id or something is missing');
    res.send(user);
})

module.exports = router; 