require('dotenv').config();

var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Location    = require("./models/location"),
    Comment     = require("./models/comment"),
    User        = require("./models/user")
    
    
//requiring routes
var commentRoutes    = require("./routes/comments"),
    locationRoutes   = require("./routes/locations"),
    indexRoutes      = require("./routes/index")

// mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true, useCreateIndex: true });
mongoose.connect('mongodb://localhost:27017/yelp_camp_v10', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
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

app.use("/", indexRoutes);
app.use("/locations", locationRoutes);
app.use("/locations/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The Annex Server Has Started!");
});