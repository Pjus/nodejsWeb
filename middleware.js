const { campgroundSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/reviews");

module.exports.isLogedIn = (req, res, next) => {
    if( !req.isAuthenticated() ){
        // store the url they are requesting!
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in!');
        return res.redirect('/users/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {

    const result = campgroundSchema.validate(req.body);
    if(result.error){
        next(new ExpressError(result.error.details, 400));
    } else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', "You don't have permission!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user.id)){
        req.flash('error', 'You do not have permission!')
        res.redirect(`/campgrounds/${id}`);
    }
    next();
}


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        next(new ExpressError(error, 400));
    } else {
        next();
    }
}