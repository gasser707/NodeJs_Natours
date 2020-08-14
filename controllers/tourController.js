const catchAsync = require('../utils/catchAsync');
const Tour = require('.//../models/tourModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/AppError');

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([
        {
            //filtering
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
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    //radius is in radians, got by dividing by the radius of earth in milles or kms
     const radius = unit ==='mi'?distance/3963.2:distance/6378.1

    if (!lat || !lng) next(new AppError('Please provide latitude and longitude in this format: lat,lng', 400));

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

    res.status(200).json({
        status: 'success',
        results:tours.length,
        data:{
            tours:tours
        }
    });
});

exports.getDistances = catchAsync(async(req, res, next)=>{
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    //radius is in radians, got by dividing by the radius of earth in milles or kms

    if (!lat || !lng) next(new AppError('Please provide latitude and longitude in this format: lat,lng', 400));

    const multiplier = unit ==='mi'?0.000621371:0.001
    const distances = await Tour.aggregate([
        {
            //must have a geo-spatial index before usage, if u have multiple geo-spatial indexes u have to use keys 
            $geoNear:{
                near: {
                    type: 'Point',
                    coordinates: [+lng, +lat]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },

        {
            //like select
            $project:{
                distance:1,
                name:1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        results:distances.length,
        data:{
            distances:distances
        }
    });

})