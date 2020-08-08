const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        trim: true,
        maxlength: [20, 'A username must be at most 20 characters'],
        minlength: [1, 'A username must be at least 1 characters'],
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [8, "A Password must at least be 8 characters"]
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your email"],
        validate: {
            //this only works on save, create not findOneUpdate
            validator: function (pass) {
                return pass === this.password;
            },
            message: 'The passwords you entered do not match'
        }
    }
});

//to encrypt passwords
userSchema.pre('save', async function (next) {
    //only run this function was modified 
    if (!this.isModified('password')) {
        return next();
    }
    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12)
    this.confirmPassword = undefined
    //we don't want to save it to db
    next()
});

const User = mongoose.model('User', userSchema);
module.exports = User;