class APIFeatures {
    
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {

        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'limit', 'sort', 'fields'];
        excludedFields.forEach(el => {
            delete queryObj[el];
        });
        // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

        //we do that to be able to apply sort and find methods
        let queryStr = JSON.stringify(queryObj);

        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;

    }

    sort() {

        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limit() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {

        const page = +this.queryString.page || 1;

        const limit = +this.queryString.limit || 5;
        //lets say limit is 10 , so on page 2 i have to skip the first 10 values 
        const skip = (page - 1) * limit;


        // query.sort().select().skip().limit().... this is why we await at the very end
        this.query = this.query.skip(skip).limit(limit);

        return this;

    }



}
module.exports = APIFeatures;