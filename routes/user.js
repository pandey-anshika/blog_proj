const User = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req,res)=>{
    const newUsers = await User({emailId: req.body.emailId , password: req.body.password});
    res.send(newUsers)
    .then(() => res.status(200))
    .catch((err)=> res.status(500).send("error occured..."))
});

router.get('/', async (req,res)=>{
    User.findOne({emailId: req.body.emailId, password: req.body.password})
    .then(user => {
        if(!user) res.status(404);
        else res.status(500);
    })
    .catch(err =>{
        res.status(500).send(err.message);
    })
});

router.post('/', async(req,res)=>{
    const e = validate(req.body);
    if (e) return res.status(400).send(e.message);
    let user = new User({
        name: req.body.name,
        mobileNo: req.body.mobileNo,
        emailId: req.body.emailId,
        password: req.body.password,
        bio: req.body.bio
    });
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