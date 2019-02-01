var Campground = require("../models/campground.js"),
    Comment = require("../models/comment");


var middlewareObj = {};




middlewareObj.checkCampgroundOwnership = function (req, res, next){
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err){
            res.redirect("/campgrounds/"+req.params.id);
        }
        if(req.user){
            if(foundCampground.author.id.equals(req.user._id)){
                return next();
            }
        }
        req.flash("error", "You are not authorized to do that.");
        res.redirect("/campgrounds/"+req.params.id);
    });
}


middlewareObj.checkCommentOwnership = function (req, res, next){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err){
            res.redirect("/campgrounds");
        } else if(req.user){
            if(foundComment && foundComment.author.id.equals(req.user._id)){
                return next();
            } else {
                req.flash("error", "You are not authorized to do that.");
                res.redirect("/campgrounds/"+req.params.id);
            }
        } else {
            req.flash("error", "You need to be logged in.");
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
}

middlewareObj.checkCampOrComOwner = function (req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground) {
            if(err){
                req.flash("error", "There has been an error with your request");
                res.redirect("/campgrounds/"+req.params.id);
            } else {
                Comment.findById(req.params.comment_id, function(err, foundComment) {
                    if(err){
                        req.flash("error", "There has been an error with your request");
                        res.redirect("/campgrounds/"+req.params.id);
                    } else if(
                    foundComment.author.id.toString() === req.user._id.toString() ||
                    foundCampground.author.id.toString() === req.user._id.toString())
                    {
                        next();
                    } else {
                        req.flash("error", "There has been an error with your request");
                        res.redirect("/campgrounds/"+req.params.id);
                    }
                });
            }
        });
    } else {
        req.flash("error", "You are not authorized to do that.");
        res.redirect("/campgrounds/"+req.params.id);
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in!");
    res.redirect("/login");
}

middlewareObj.isLoggedOut = function(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }
    req.flash("success", "You are logged in!");
    res.redirect("/campgrounds");
}


module.exports = middlewareObj;