const express = require("express");
const siteController = express.Router();
const User           = require("../models/user");
const Course           = require("../models/course");
const bcrypt         = require("bcrypt");
const bcryptSalt     = 10;
const ensureLogin = require("connect-ensure-login");
const passport      = require("passport");

siteController.get("/", (req, res, next) => {
  res.render("index");
});

function checkRoles(role) {
  return function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      res.redirect('/login')
    }
  }
}

var checkGuest  = checkRoles('GUEST');
var checkEditor = checkRoles('EDITOR');
var checkAdmin  = checkRoles('ADMIN');

// siteController.get('/private', checkRoles('ADMIN'), (req, res) => {
//   res.render('private', {user: req.user});
// });

siteController.get('/private', checkAdmin, (req, res) => {
  res.render('private', {user: req.user});
});

siteController.get('/posts', checkEditor, (req, res) => {
  res.render('private', {user: req.user});
});

siteController.get("/signup", (req, res, next) => {
  res.render("signup");
});

siteController.get("/login", (req, res, next) => {
  res.render("login");
});

siteController.post("/login", passport.authenticate("local", {
  successRedirect: "/private-page",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

siteController.post("/signup", (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;

  if (username === "" || password === "") {
    res.render("signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("signup", { message: "The username already exists" });
      return;
    }

    var salt     = bcrypt.genSaltSync(bcryptSalt);
    var hashPass = bcrypt.hashSync(password, salt);

    var newUser = User({
      username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("signup", { message: "The username already exists" });
      } else {
        res.redirect("/login");
      }
    });
  });
});

siteController.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = siteController;
