const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Bring in post model
let User = require('../models/user');

router.get('/login', ensureUnAuthenticated, (req, res) =>{
  res.render('login');
});

router.get('/register', ensureUnAuthenticated, (req, res) =>{
  res.render('register');
});

router.get('/:id/edit', ensureAuthenticated, (req, res) =>{
  if(req.user.username == req.params.id){
    res.render('edit_profile', {
      theuser: req.user
    });
  }else{
    req.flash('success', 'you do not have permissions');
    res.redirect('/');
  }
});

// Register POST request
router.post('/register', (req, res) =>{
  const name = req.body.name;
  const email = req.body.email.toLowerCase();
  const username = req.body.username.toLowerCase();
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do NOT match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors: errors
    });
  }else{

    // Checks if username or email has been used before
    User.findOne({$or: [{'email': email}, {'username': username}]}, (err, user) => {
      if(err) throw err;
      if(user){ //If user is found with email or username that newUser is trying to register with
        if(user.email == email && user.username == username){
          res.render('register', {
            errors: [{param:"email", msg:"Email is already in use", value: ""}, {param:"username", msg:"Username is already in use", value: ""}]
          });
        }else if(user.email == email){
          res.render('register', {
            errors: [{param:"email", msg:"Email is already in use", value: ""}]
          });
        }else{
          res.render('register', {
            errors: [{param:"username", msg:"Username is already in use", value: ""}]
          });
        }
      }else if(username == "register" || username == "login" || username == "logout"){
        res.render('register', {
          errors: [{param:"username", msg:"Username is already in use", value: ""}]
        });
      }else{
        let newUser = new User({
          name:name,
          email:email,
          username:username,
          password:password,
          age:"NA",
          relationship:"NA",
          job:"NA",
          education:"NA"
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) =>{
            if(err){
              console.log(err);
            }
            newUser.password = hash;
            newUser.save((err)=>{
              if(err){
                console.log(err);
                return;
              }else{
                req.flash('success', 'You are now registered and can log in');
                res.redirect('/users/login');
              }
            });
          });
        });
      }
    });
  }
});

// Login POST request
router.post('/login', (req, res, next) =>{
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', (req, res) =>{
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

router.post('/:id/edit', ensureAuthenticated, (req, res) =>{

});

router.get('/:id', ensureAuthenticated, (req, res) => {
  let query = {username:req.params.id};
  User.findOne(query, function(err, user){
    if(err) throw err;

    if(user){
      res.render('profile', {
        theuser:user
      });
    }else{
      req.flash('success', 'no user found');
      res.redirect('/');
    }
  })
});

// Checks if user is logged in and redirects to login if NOT
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/users/login');
  }
}

// Checks if user is logged in or not and if they ARE logged in then they are redirected to index so that they cannot login/register
function ensureUnAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    res.redirect('/');
  }else{
    return next();
  }
}

module.exports = router;
