var express = require("express");
var router  = express.Router();
var Location = require("../models/location");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);


//INDEX - show all locations
router.get("/", function(req, res){
    // Get all locations from DB
    Location.find({}, function(err, allLocations){
       if(err){
           console.log(err);
       } else {
          res.render("locations/index",{locations:allLocations});
       }
    });
});

//CREATE - add new location to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to locations array
  var name = req.body.name;
  var image = req.body.image;
  var price = req.body.price;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  };
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newLocation = {name: name, image: image, price: price, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new location and save to DB
    Location.create(newLocation, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to locations page
            console.log(newlyCreated);
            res.redirect("/locations");
        }
    });
  });
});

//NEW - show form to create new location
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("locations/new"); 
});

// SHOW - shows more info about one location
router.get("/:id", function(req, res){
    //find the location with provided ID
    Location.findById(req.params.id).populate("comments").exec(function(err, foundLocation){
        if(err){
            console.log(err);
        } else {
            console.log(foundLocation);
            //render show template with that location
            res.render("locations/show", {location: foundLocation});
        }
    });
});

// EDIT LOCATION ROUTE
router.get("/:id/edit", middleware.checkLocationOwnership, function(req, res){
    Location.findById(req.params.id, function(err, foundLocation){
        res.render("locations/edit", {location: foundLocation});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkLocationOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    req.body.location.lat = data[0].latitude;
    req.body.location.lng = data[0].longitude;
    req.body.location.location = data[0].formattedAddress;

    Location.findByIdAndUpdate(req.params.id, req.body.location, function(err, location){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/locations/" + location._id);
        }
    });
  });
});

// DESTROY LOCATION ROUTE
router.delete("/:id",middleware.checkLocationOwnership, function(req, res){
   Location.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/locations");
      } else {
          res.redirect("/locations");
      }
   });
});


module.exports = router;

