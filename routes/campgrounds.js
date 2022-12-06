const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const CatchAsync = require('../utilities/CatchAsync');
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const ExpressError = require('../utilities/ExpressError');



const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const errorMsg = error.details.map(el => el.message).join(',')
        throw new ExpressError(errorMsg, 400)
    } else {
        next();
    }
}

router.get('/', CatchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}));

router.delete('/:id', CatchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}));

router.put('/:id', validateCampground, CatchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.get('/new', (req, res) => {
    res.render('campgrounds/new')
});

router.post('/', validateCampground, CatchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.get('/:id', CatchAsync(async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { campground })
}));

router.get('/:id/edit', CatchAsync(async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', { campground })
}));


module.exports = router;