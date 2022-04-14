if(process.env.NODE_ENV !=="production") {
    require('dotenv').config();
}

const express = require("express");
const path = require('path')
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const morgan = require("morgan");
const ExpressError = require("./utils/ExpressError");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet")
const MongoStore = require('connect-mongo');

const User = require("./models/user");
const Campground = require("./models/campground");

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoute = require('./routes/review');
const userRoute = require('./routes/users');
// const dbUrl = process.env.DB_URL
// mongodb://localhost:27017/yelp-camp
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO ERROR!!!!")
        console.log(err)
    });

const app = express();

app.engine('ejs', ejsMate);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static('public'))
app.use(mongoSanitize());
// app.use(helmet());

const secret = process.env.SECRET || 'thisissecretkey!!'

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
})

store.on('error', function(e){
    console.log("session store error", e);
})

const sessionConfig = {
    store,
    name:'sessionName',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now(),
        maxAge: 2 * 60 * 60 * 1000
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.noImage = process.env.NOIMAGE_URL;
    next();
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoute);
app.use('/users', userRoute);

app.get('/', (req, res) => {
    res.render('main');
});

app.get('/home', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('home', { campgrounds });
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went Wrong!';
    console.log('Error:', err);
    res.status(statusCode).render('error', { err });
    // res.send("Something went wrong");
})

app.listen("3000", () => {
    console.log("Lisenting 3000")
});