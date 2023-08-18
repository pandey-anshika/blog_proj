const Joi = require('joi');
const mongoose = require('mongoose');

const Category= mongoose.model('Category', new mongoose.Schema( {
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    desc: {
        type: String,
        required: true,
        minlength:20,
        maxlength:100
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}));


function validateUser(catg){
    const schema = {
        title: Joi.string().min(3).max(30).required(),
        desc: Joi.string().min(20).max(100).required(),
        createdAt: Joi.number(),
        updatedAt: Joi.number(),
    };
    return Joi.valid(catg, schema);

}
exports.Category = Category;
exports.validateUser = validateUser;
