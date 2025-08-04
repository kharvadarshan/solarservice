const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name :{
        type:String,
        required:true
    }
});

const User = mongoose.Model('User',userSchema);

module.exports = User;


