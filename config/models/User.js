const mongoose = require('mongoose');


const userSchema = new userSchema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: String
    }

})

const User = mongoose.model('User', userSchema);

module.exports = User;