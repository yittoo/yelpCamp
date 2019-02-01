var express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    middleware = require("../middleware") //will require index.js by default

router.get("/", function(req, res){
    // Get all campgrounds from db
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
    // res.render("campgrounds", {campgrounds: campgrounds});
});

router.post("/", middleware.isLoggedIn, function(req, res){
    // campgrounds.push({name: req.body.name, image: req.body.image});
    Campground.create({
        name: req.body.name,
        price: req.body.price,
        image: req.body.image, 
        description: req.body.description, 
        author: {
            id: req.user._id, 
            username: req.user.username
        }
    },
        function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                req.flash("success", "New Campground: \""+ newlyCreated.name + "\" added!");
                res.redirect("/campgrounds");
            }
    });
});

router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

router.get("/:id", function(req, res){
    //find one page with same id and show info related to that
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            req.flash("error", "There has been an error with your request");
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("error", "There has been an error with your request");
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    })
});

router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground,
    function(err, updatedCampground){
        if(err){
            req.flash("error", "There has been an error with your request");
            res.redirect("/campgrounds");
        } else {
            req.flash("success", '"' + updatedCampground.name + "\" Edited!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err, campgroundRemoved){
        if(err){
            req.flash("error", "There has been an error with your request");
            res.redirect("/campgrounds");
        }
        Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } } , function(err){
            if(err){
                req.flash("error", "There has been an error with your request");
                res.redirect("/campgrounds");
            }
            req.flash("success", "Campground Deleted");
            res.redirect("/campgrounds");
        });
    })
});


module.exports = router;