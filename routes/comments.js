var express = require("express"),
    router = express.Router({mergeParams: true}),
    Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    middleware = require("../middleware") //will require index.js by default


router.post("/", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                req.flash("error", "There has been an error with your request");
                res.redirect("/campgrounds/" + req.params.id);
            } else {
                Comment.create(req.body.comment, function(err, comment){
                    if(err){
                        req.flash("error", "There has been an error with your request");
                        res.redirect("/campgrounds/" + req.params.id);
                    } else {
                        comment.author.username = req.user.username;
                        comment.author.id = req.user._id;
                        comment.save();
                        foundCampground.comments.push(comment);
                        foundCampground.save(function(err, data){
                            if(err){
                                req.flash("error", "There has been an error with your request");
                                res.redirect("/campgrounds/" + req.params.id);
                            } else {
                                req.flash("success", "Comment Posted!");
                                res.redirect("/campgrounds/"+req.params.id);
                            }
                        });
                    }
                });
            }
        });
});


router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("error", "There has been an error with your request");
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            res.render("comments/new", {campground: foundCampground});
        }
    });
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err){
            req.flash("error", "There has been an error with your request");
            res.redirect("/campgrounds");
        } else {
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err){
                    req.flash("error", "There has been an error with your request");
                    res.redirect("/campgrounds");
                } else {
                    res.render("comments/edit", {comment: foundComment, campground: foundCampground});
                }
            });
        }
    });
});

router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
        Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, 
            function(err, updatedComment){
                if(err){
                    res.redirect("/campgrounds");
                }
                req.flash("success", "Comment Edited!");
                res.redirect("/campgrounds/"+req.params.id);
        });
});

router.delete("/:comment_id", middleware.checkCampOrComOwner, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err, commentRemoved){
        if(err){
            console.log(err);
        } else {
            req.flash("success", "Comment Deleted!")
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
})



module.exports = router;