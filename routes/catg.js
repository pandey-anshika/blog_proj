const {Category, validateUser} = require('../models/category');
const auth = require('../mw/auth');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.get('/', auth, async (req, res) => {
    const categories = await Category.find();
    res.send(categories);
    });

router.get('/:id', auth, async (req, res) => {
        const category = await Category.findById(req.params.id);
        if(!category){
            return res.status(404).send('Category not found');
        }else{
            res.send(category);
        }
    });

 router.post('/', auth, async (req, res) => {
        const error = [];
        const {title, desc} = req.body;
        if (!title) {
            error.push({error:'Title is required'});
        }
        if (!desc){ error.push({error:'Description is required'});}
        if (error.length){ return res.status(400).send(error);}
        
        const category = await Category.findOne({title:title});
        if(category){
            return res.status(401).send('category already exists')
        }else{
            try{
                let newCat=new Category ({
                    title :  title ,
                    description :   desc,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                    })
                    
                var savedcat =await newCat .save();
                res.status(201).send(savedcat);
               }
                 catch(err)
                    {
                        console.log("Error", err );
                        res.status(500).send(`Server Error`);
                    }
        }
    });

router.put('/:id', auth, async (req, res) => {
        const error = [];
        const {title, desc} = req.body;
        if (!title) error.push({error:'Title is required'});
        if (!desc) error.push({error:'Description is required'});
        if (error.length) return res.status(400).send(error);

        const id = new mongoose.Types.ObjectId(req.params.id) ;
        try{
            let updatedCategory=await  Category.findOneAndUpdate({_id:id},{
                $set:{'title':title,
                'desc':desc,'updatedAt':Date.now()
            }},{'new':true});
            if(!updatedCategory){
                return res.status(400).json({message:'do not find category of this id'});
            }
            else{
                res.status(200).json({'data':'update success','result':updatedCategory})
                };
                }catch(e){
                    res.status(500).send(`Error updating the category ${e}`);
        }
    });

router.delete('/:id', auth, async (req, res) => {
        const category = await Category.findByIdAndDelete(req.params.id);
        if(!category){
            return res.status(404).send('Category not found with this id');
        }
        res.send(category);
    });

 module.exports = router;