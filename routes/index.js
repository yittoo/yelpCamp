var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/user"),
    middleware = require("../middleware"); //will require index.js by default



router.get("/", function(req,res){
    res.render("landing");
});

router.get("/register", middleware.isLoggedOut, function(req, res) {
    res.render("user/register");
});

router.post("/register", middleware.isLoggedOut, function(req, res) {
    User.register(new User({username: req.body.username}), req.body.password, 
    function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("campgrounds");
        });
    });
});

router.get("/login", middleware.isLoggedOut, function(req, res) {
    res.render("user/login");
});

router.post("/login",passport.authenticate("local", 
    {
        successRedirect: "back",
        failureRedirect: "/login",
        failureFlash: true
    }),
        function(req, res) {
        
});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});



module.exports = router;