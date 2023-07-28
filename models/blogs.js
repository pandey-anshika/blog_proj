const Joi = require('joi');
const mongoose = require('mongoose');

const Blogs= mongoose.model('Blogs', new mongoose.Schema( {
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20
    },
    shortDes: {
        type: String,
        minlength: 5,
        maxlength: 30
    }, 
    desc: {
        type: String,
        required: true
    },
    createdBy: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}));

function validateUser(blog){
    const schema = {
        title: Joi.string().min(3).max(20).required(),
        shortDes: Joi.string().min(5).max(30),
        desc: Joi.string(),
        createdBy: Joi.string(),
        createdAt: Joi.number(),
        updatedAt: Joi.number()
    };
    return Joi.validate(blog, schema);

}
exports.Blogs = Blogs;
