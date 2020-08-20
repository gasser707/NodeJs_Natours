const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// const multiStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });





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
    if (req.file)
        filteredBody.photo = req.file.filename;
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