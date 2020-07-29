const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//we get access to val here because we are calling from param middleware
exports.checkID = (req, res, next,val) => {

    if (val > tours.length - 1) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid id'
        });
    }

    next();
};

//middleware to check body has right fields before posting
exports.checkBody = (req, res, next)=>{
    if(req.body.name &&req.body.duration && req.body.difficulty){
        return next()
    }

    return res.status(400).json({
        status:'fail',
        message:'not enough info provided'
    })

}

exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours,
        },
    });
};

exports.getTour = (req, res) => {
    const tour = tours[req.params.id];

        return res.status(200).json({
            status: 'success',
            results: 1,
            data: {
                tour: tour,
            },
        });
   
};

exports.createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);

    //use asynchronous because ur inside the event loop
    fs.writeFile(
        `${__dirname}/../dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            res.status(201).json({
                status: 'success',
                data: {
                    tour: newTour,
                },
            });
        }
    );
};

exports.deleteTour = (req, res) => {

    const tour = tours[req.params.id];

    res.status(204).json({
        status: 'success',
        data: null,
    });

};

exports.updateTour = (req, res) => {
    const tour = tours[req.params.id];


    res.status(200).json({
        status: 'success',
        data: {
            tour: 'updated tour',
        },
    });

};