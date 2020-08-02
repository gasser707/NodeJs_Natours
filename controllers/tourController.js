// const fs = require('fs');
const Tour = require('.//../models/tourModel');

class APIFeatures{
    constructor(query, queryString){
        this.query=query
        this.queryStr= queryString
    }

    filter(){

        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'limit','sort', 'fields'];
        excludedFields.forEach(el => {
            delete queryObj[el]
        });
        // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

        //we do that to be able to apply sort and find methods
        let queryStr = JSON.stringify(queryObj);

        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query.find(JSON.parse(queryStr));

    }
}

exports.getAllTours = async (req, res) => {
    try {
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'limit','sort', 'fields'];
        excludedFields.forEach(el => {
            delete queryObj[el]
        });
        // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

        //we do that to be able to apply sort and find methods
        let queryStr = JSON.stringify(queryObj);

        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let query = Tour.find(JSON.parse(queryStr));


        
        
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ')
            query=query.select(fields)
        }else{
            query= query.select('-__v')
        }

        const page = +req.query.page||1;

        const limit = +req.query.limit||5;
        //lets say limit is 10 , so on page 2 i have to skip the first 10 values 
        const skip = (page-1)*limit;


         if(req.query.page){
           
            const numTours = await Tour.countDocuments();
              if(skip>=numTours){
                  throw new Error(`This page doesn't exist`)
              }
         }

        // query.sort().select().skip().limit().... this is why we await at the very end
        query= query.skip(skip).limit(limit)

        const tours = await query;
    
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours: tours,
            },
        });
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
        //Tour.findOne({_id: req.params.id})
        return res.status(200).json({
            status: 'success',
            results: 1,
            data: {
                tour: tour,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }


};

exports.createTour = async (req, res) => {

    try {
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour,
            },
        });
    }
    catch (err) {

        res.status(400).json({
            status: 'fail',
            message: err
        });
    }



};

exports.updateTour = async (req, res) => {

    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        //returns the new updated document
        res.status(200).json({
            status: 'success',
            data: {
                tour: tour,
            },
        });

    }
    catch (err) {

        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent'
        });
    }

};


exports.deleteTour = async (req, res) => {

    try {

        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null,
        });

    } catch{
        res.status(404).json({
            status: 'fail',
            message: 'Invalid data sent'
        });
    }


};

exports.aliasTopTours = (req, res, next)=>{
    req.query.limit ='5';
    req.query.sort= '-ratingsAverage,price';
    req.query.fields= 'name,price,ratingsAverage,summary,difficulty'
    next()
}

