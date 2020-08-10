const catchAsync = require('../utils/catchAsync');
const Tour = require('.//../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');
const AppError = require('../utils/AppError');

exports.getAllTours = catchAsync(async (req, res, next) => {

    const features = new APIFeatures(Tour.find(), req.query).filter().sort().limit().paginate();
    const tours = await features.query;

    return res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours,
        },
    });

});

exports.getTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findById(req.params.id);
    //Tour.findOne({_id: req.params.id})
    if (tour) {
        return res.status(200).json({
            status: 'success',
            data: {
                tour: tour,
            },
        });
    }
    else {
        return next(new AppError('No tour found with that ID', 404));
    }

});

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour,
        },
    });

});

exports.updateTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    //returns the new updated document

    if (tour) {
        res.status(200).json({
            status: 'success',
            data: {
                tour: tour,
            },
        });
    }

    else {
        return next(new AppError('No tour with this ID was found', 404));
    }

});


exports.deleteTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (tour) {

        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    else {
        return next(new AppError('No tour with such ID was found'));
    }

});

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },

            }
        },
        {
            //have to use same name avgPrice
            $sort: {
                avgPrice: 1
            }
        }
    ]);

    return res.status(200).json({
        status: 'success',
        results: stats.length,
        data: {
            stats: stats,
        },
    });


});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {

    const year = +req.params.year;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            //where accumulation happens
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },

        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        // { cuts to 6 results only
        //     $limit:6
        // }
    ]);

    res.status(200).json({
        status: 'success',
        results: plan.length,
        data: {
            plan: plan,
        },
    });


});
