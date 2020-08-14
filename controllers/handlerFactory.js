const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/APIFeatures');
exports.deleteOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (doc) {

        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    else {
        return next(new AppError('No document with such ID was found'));
    }

});

exports.updateOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    //returns the new updated document

    if (doc) {
        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    }

    else {
        return next(new AppError('No document with this ID was found', 404));
    }

});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            data: doc,
        },
    });

});

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    // populate => fill field up with data
    let query = Model.findById(req.params.id) 
    if(populateOptions){
        query= query.populate(populateOptions)
    }
    const doc = await query
    //Tour.findOne({_id: req.params.id})
    if (doc) {
        return res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    }
    else {
        return next(new AppError('No tour found with that ID', 404));
    }

});

exports.getAll = Model =>catchAsync(async (req, res, next) => {
      //to allow for nested get reviews on tour
      let filter={};
      if(req.params.tourId){
          filter ={
              tour:req.params.tourId
          }
      }

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limit().paginate();
    const doc = await features.query

    return res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc,
        },
    });

});
// This works because of javascript closures, the inner function gets access to outer function vars even when the 
//other value has returned 