const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }).then(() => {
        console.log('db connection successful');
    }).catch(() => console.log('Error connecting to the D'));

const port = process.env.PORT||3000;
const server = app.listen(port, () => {
    console.log(`running on port ${port}...`);
});


//for global unhandled promise errors, this is a last safety net 

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection, will shutdown');

    process.exit(1); // 1 for uncalled exception
});

//for uncaught exception
process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception, will shutdown');

    process.exit(1); // 1 for uncalled exception

});