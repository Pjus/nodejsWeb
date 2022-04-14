const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLogedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require('multer');
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

const campgroundController = require("../controllers/campgrounds");

router.route('/')
    .get(campgroundController.index)
    .post(isLogedIn, upload.array('image'), validateCampground, catchAsync(campgroundController.newPost))
;

router.get('/new', isLogedIn, campgroundController.new);

router.route('/:id')
    .get(catchAsync(campgroundController.show))
    .put(isAuthor, upload.array('image'), campgroundController.editPut)
    .delete(isLogedIn, isAuthor, campgroundController.delete)
;

router.get('/:id/edit', isLogedIn, isAuthor, campgroundController.edit);

module.exports = router;