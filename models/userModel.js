const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
        minlength: [8, "A Password must at least be 8 characters"],
        select: false
        //so it doesn't appear when returned
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
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    }

});

//to encrypt passwords
userSchema.pre('save', async function (next) {
    //only run this function was modified 
    if (!this.isModified('password')) {
        return next();
    }
    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    //we don't want to save it to db
    next();
});


//this is called an instance method, it's available on all documents of a schema
//we cant compare manually because candidate password isn't hashed 
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        if (changedTimeStamp > JWTTimestamp) {
            return true;
        }
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
    //we send the un-encrypted to email and the encrypted stays in db to be compared later
};

const User = mongoose.model('User', userSchema);
module.exports = User;