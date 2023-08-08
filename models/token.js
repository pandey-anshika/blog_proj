const mongoose = require("mongoose");
const user = require("../routes/user");
const bcrypt = require('bcrypt');

const tokenSchema = mongoose.model('token', new mongoose.Schema({
    emailID: {
        type: String,
        required: true,

    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 3600,
    },
}));
function validateToken(token){
    const schema = {
        emailID: Joi.String().required(),
        token: Joi.String().required(),
        createdAt: Joi.Date().required()
    }
    return Joi.valide(token, schema);
}
// tokenSchema.pre('save', async function (next){
//     if(this.isModified('token')){
//         this.token = await bcrypt.hash(this.token, 10)
//     }
//     next();
// });
// tokenSchema.methods.compareToken = async function(token){
//     const result = await bcrypt.compareSync(token, this.token);
//     return result;
// }
exports.tokenSchema = tokenSchema;
exports.validateToken = validateToken;