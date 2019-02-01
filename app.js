var express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),
    methodOverride   = require("method-override"),
    Campground       = require("./models/campground"),
    Comment          = require("./models/comment"),
    User             = require("./models/user"),
    seedDB           = require("./seeds"),
    flash            = require("connect-flash");
    
var commentRoutes   = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");


mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true });
// mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });
// mongoose.connect("mongodb://yittoo:jZVBG8TK@ds119049.mlab.com:19049/yityelpcamp", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());

// seedDB();

app.use(require("express-session")({
    secret: "once again rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds", campgroundRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("yelp is a go");
});