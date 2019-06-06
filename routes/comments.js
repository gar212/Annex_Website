var express = require("express");
var router  = express.Router({mergeParams: true});
var Location = require("../models/location");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new",middleware.isLoggedIn, function(req, res){
    // find location by id
    console.log(req.params.id);
    Location.findById(req.params.id, function(err, location){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {location: location});
        }
    })
});

//Comments Create
router.post("/",middleware.isLoggedIn,function(req, res){
   //lookup location using ID
   Location.findById(req.params.id, function(err, location){
       if(err){
           console.log(err);
           res.redirect("/locations");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               req.flash("error", "Something went wrong");
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               location.comments.push(comment);
               location.save();
               console.log(comment);
               req.flash("success", "Successfully added comment");
               res.redirect('/locations/' + location._id);
           }
        });
       }
   });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("comments/edit", {location_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/locations/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/locations/" + req.params.id);
       }
    });
});

module.exports = router;