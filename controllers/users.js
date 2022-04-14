const User = require("../models/user");

module.exports.user = (req, res) => {
    res.render("users/profile");
};

module.exports.getRegister =  (req, res) => {
    res.render('users/signup');
};

module.exports.postRegister = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        console.log(username, email, password)
        const user = new User({email, username});
        const newUser = await User.register(user, password);
        req.login(newUser, err => {
            if(err) return next(err)
            req.flash('success', 'Welcome to Site!');
            res.redirect('/campgrounds');
        });


    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
};

module.exports.login = (req, res) => {
    res.render("users/login")
};

module.exports.postLogin = async (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/home';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!")
    res.redirect('/');
};