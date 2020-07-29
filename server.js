const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }).then(() => {
        console.log('db connection successful');
    });


const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A tour must have a name"],
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    }
});

const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
    name: 'The Forest Hiker',
    rating: 4.7,
    price: 497
});

testTour.save().then(doc => {
    console.log(doc);
}).catch(err => {
    console.log(err);
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`running on port ${port}...`);
});
