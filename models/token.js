const mongoose = require("mongoose");
//const  = require("../routes/user");
const bcrypt = require('bcrypt');

const tokenSchema = mongoose.model('token', new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
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
// tokenSchema.pre('save', async function (next){
//     if(this.isModified('token')){
//         this.token = await bcrypt.hash(this.token, 10)
//     }
//     next();
// // });
// tokenSchema.methods.compareToken = async function(token){
//     const result = await bcrypt.compareSync(token, this.token);
//     return result;
// };
// exports.tokenSchema = tokenSchema;