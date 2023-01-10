const express = require('express');
const router = express.Router();
const CatchAsync = require('../utilities/CatchAsync');
const passport = require('passport');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const {storage} = require('../cloudinary')
const multer  = require('multer')
const upload = multer({ storage })


router.route('/')
    .get(CatchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, CatchAsync(campgrounds.createCampground))


router.get('/new', isLoggedIn, campgrounds.renderNewForm);


router.route('/:id')
    .get(CatchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, CatchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, CatchAsync(campgrounds.deleteCampground));


router.get('/:id/edit', isLoggedIn, isAuthor, CatchAsync(campgrounds.renderEditCampground));


module.exports = router;