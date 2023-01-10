const Campground = require('../models/campground');

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)    
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(file => ({url: file.path, filename:file.filename}))
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'The new campground was successfully created!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate:{
            path: 'author'
        }
        }).populate('author');
    if (!campground) {
        req.flash('error', 'The campground was not found');
        return res.redirect('/campgrounds');
    } else {
        res.render('campgrounds/show', { campground })
    }
}


module.exports.renderEditCampground = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'The campground was not found');
        return res.redirect('/campgrounds');
    } else {
        res.render('campgrounds/edit', { campground })
    }
}


module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'The campground was successfully updated!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'The campground was successfully deleted');
    res.redirect('/campgrounds')
}