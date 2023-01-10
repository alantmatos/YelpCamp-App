if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utilities/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');



//routes file
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');


//database connection
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true, ( no longer supported )
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

//cookie configuration object
const sessionConfig = {
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: + 1000 * 60 * 60 * 24 * 7
    }
};


// tell express to parse the body, if not parsed body will be empty
app.use(express.urlencoded({ extended: true }));

// forms only make a get and post requests, im usng method overRide to
// make a patch request in order to update data.
app.use(methodOverride('_method'));


//config
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//flash middleware
app.use((req, res, next) => {
    // console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//using the pre set up route
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', userRoutes);


//root page
app.get('/', (req, res) => {
    res.render("home")
});

//404 page
app.all('*', (req, res, next) => {
    //res.send('404! My dog ate this page, Are you sure this is the one you are looking for?')
    next(new ExpressError('Not Found', 404))
});


//Error handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Ugh! Something went wrong';
    res.status(statusCode).render('error', { err });
});

//database connection feedback
app.listen(3000, () => {
    console.log("listening on Port 3000")
});