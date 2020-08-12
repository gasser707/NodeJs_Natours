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
