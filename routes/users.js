const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const expressValidator = require('express-validator');
// Bring in user model
let User = require('../models/user');

//Register Form
router.get('/register', function(req, res){
  res.render('register');
});

//Declare custom validators for email and username
router.use(expressValidator({
    customValidators: {
      isUsernameAvailable(username) {
        return new Promise((resolve, reject) => {
          User.findOne({ username: username }, (err, user) => {
            if (err) throw err;
            if(user == null) {
              resolve();
            } else {
              reject();
            }
          });
        });
      }
    }
  })
);
router.use(expressValidator({
    customValidators: {
      isEmailAvailable(email) { // declare custom validator
        return new Promise((resolve, reject) => {
          User.findOne({ email: email }, (err, user) => {
            if (err) throw err;
            if(user == null) {
              resolve();
            } else {
              reject();
            }
          });
        });
      }
    }
  })
);

// Register Process
router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('email', 'Email already in use').isEmailAvailable();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('username', 'Username already in use').isUsernameAvailable();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  // Async Validation
  req.asyncValidationErrors().then(() => {
    //no errors, create user
    const newUser = new User({
      name:name,
      email:email,
      username:username,
      password: password
    });
    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(newUser.password, salt, (err, hash)=>{
          if(err)throw err;
          newUser.password =hash;
          newUser.save(err=>{
            if(err) throw err;
            req.flash('success', 'You are now registered and can log in');
            res.redirect('/users/login');
          });
        });
      });
  }).catch((errors) => {

      if(errors) {
        res.render('register', {
            errors: errors
          });
      };
  });
});
// End of async validation

// Login form
router.get('/login', (req, res)=>{
    res.render('login');
})
// Login process
router.post('/login', (req, res, next)=>{
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
})

// logout
router.get('/logout', (req,res)=>{
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
})
module.exports = router;


// Sync validation
// router.post('/register', function(req, res){
//   const name = req.body.name;
//   const email = req.body.email;
//   const username = req.body.username;
//   const password = req.body.password;
//   const password2 = req.body.password2;
//
//   req.checkBody('name', 'Name is required').notEmpty();
//   req.checkBody('email', 'Email is not valid').isEmail();
//   req.checkBody('email', 'Email already in use').isEmailAvailable();
//   req.checkBody('username', 'Username is required').notEmpty();
//   req.checkBody('username', 'Username already in use').isUsernameAvailable();
//   req.checkBody('password', 'Password is required').notEmpty();
//   req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
//
//   let errors = req.validationErrors();
//   if(errors){
//     res.render('register', {
//       errors: errors
//     });
//   } else{
//     let newUser = new User({
//       name:name,
//       email:email,
//       username:username,
//       password: password
//     });
//
//     bcrypt.genSalt(10, (err, salt)=>{
//       bcrypt.hash(newUser.password, salt, (err, hash)=>{
//         if(err)throw err;
//         newUser.password =hash;
//         newUser.save(err=>{
//           if(err) throw err;
//           req.flash('success', 'You are now registered and can log in');
//           res.redirect('/users/login');
//         });
//       });
//     });
//   }
// });
// end of sync validation
