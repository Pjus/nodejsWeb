const passport = require("passport");
const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const { isLogedIn } = require("../middleware");
const userController = require("../controllers/users");


router.route('/register')
    .get(userController.getRegister)
    .post(catchAsync(userController.postRegister))
;


router.route('/login')
    .get(userController.login)
    .post(passport.authenticate('local', { failureFlash:true, failureRedirect:'/users/login' }), userController.postLogin)
;


router.get('/', userController.user);

router.get('/logout', isLogedIn, userController.logout);

module.exports = router;
