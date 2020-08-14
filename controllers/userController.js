const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el))
            newObj[el] = obj[el];
    });
    return newObj;
};


exports.updateMe = catchAsync(async (req, res, next) => {
    //1- create error if user POSTs password data

    if (req.body.password || req.body.confirmPassword) {
        return next(new AppError('This route is not for password updates. please use /updatePassword', 400));
    }

    //sadly save() wont work as the user fetched from the db doesn't have a confirm password field which is required here
    const filteredBody = filterObj(req.body, 'name', 'email');
    const user = await User.findByIdAndUpdate(req.user._id, filteredBody, { new: true, runValidators: true });


    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    //we wont delete the user, just set him inactive
    await User.findByIdAndUpdate(req.user._id, { active: false });

    res.status(204).json({
        status: "success",
        data: null
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
//Do not attempt to update passwords with it, will pass on 'save' middleware
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);