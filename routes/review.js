const express = require("express");
const router = express.Router({mergeParams:true});
const reviewController = require("../controllers/reviews");
const catchAsync = require("../utils/catchAsync");
const { isLogedIn, validateReview, isReviewAuthor } = require("../middleware");

router.post('/', isLogedIn, validateReview, catchAsync(reviewController.review));

router.delete('/:reviewId', isLogedIn, isReviewAuthor, catchAsync());

module.exports = router;