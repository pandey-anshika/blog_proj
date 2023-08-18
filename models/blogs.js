const Joi = require('joi');
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        } ,
        content:{
            type: String,
            required: true
            },
            createdAt: {    
                type: Date,
                default: Date.now
                },
                updatedAt: {
                    type: Date,
                    default: Date.now
                    },
  })


const Blogs= mongoose.model('Blogs', new mongoose.Schema( {
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    Tags:{
        type: Array,
        default: []
      },
      Comments:[commentSchema],
      category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
}));


function validateUser(blog){
    const schema = {
        title: Joi.string().min(3).max(20).required(),
        shortDes: Joi.string().min(5).max(30),
        desc: Joi.string(),
        createdBy: Joi.string(),
        createdAt: Joi.number(),
        updatedAt: Joi.number(),
        Tags: Joi.array().items(Joi.string().min(3).max(100)),
    };
    return Joi.valid(blog, schema);

}
exports.Blogs = Blogs;
exports.validate = validateUser;
