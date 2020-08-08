const AppError = require("../utils/AppError");

const sendErrorDev = (err, res) => {

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });

};

const sendErrorProduction = (err, res) => {
  // Operational (by users), trusted error : send message to client 
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    // programming error : dont leak to client
  } else {
    console.log(err);
    res.status(500).json({
      status: 'error',
      message: 'ooops! Something went wrong here'
    });
  }
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorsDB = err => {
  const errors = Object.values(err.errors).map(el => {
    return el.properties.message;
  }
  );
  message = `Invalid Input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = err =>{
  return new AppError(' Your token has expired, please try logging in again', 401)
}
//error handling middleware always take 4 

module.exports = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500; //internal server error

  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
  else if (process.env.NODE_ENV === 'production') {
    let newErr = { ...err };

    if (err.name === 'CastError') {
      newErr = handleCastErrorDB(newErr);

    }
    if (err.code === 11000) {
      newErr = handleDuplicateFieldsDB(newErr);
    }
    if (err.name === 'ValidationError') {
      newErr = handleValidationErrorsDB(newErr);
    }
    if(err.name==='JsonWebTokenError'){
      newErr= handleJsonWebTokenError(newErr)
    }
    sendErrorProduction(newErr, res);


  }


  };