const { cloudinary } = require("../cloudinary");
const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mbxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mbxToken});

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.new = (req, res)=>{
    res.render('campgrounds/new')
};

module.exports.newPost = async (req, res, next)=>{
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log(newCamp);
    req.flash('success', 'Successfully made a new campgrond!')
    res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.show = async (req, res, next) => {
    req.session.returnTo = req.originalUrl;
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/show', { campground });
};

module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground){
        req.flash("error", 'Cannot find campground!');
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.editPut = async (req, res) => {
    const { id } = req.params;
    const updateInfo = req.body.campground;
    const foundCamp = await Campground.findByIdAndUpdate(id, {...updateInfo});
    imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    foundCamp.images.push(...imgs);
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await foundCamp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}})
        console.log(foundCamp)
    }
    await foundCamp.save();
    req.flash('success', 'Successfully updates campgrond!')
    res.redirect(`/campgrounds/${id}`);
};

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successully deletes campground!')
    res.redirect(`/campgrounds`);
};