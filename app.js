const express = require('express');
const path = require('path');
var bodyParser =require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config/database');

// Init App
const app = express();
//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//var urlencodedParser = bodyParser.urlencoded({ extended: false });

mongoose.connect('mongodb://localhost/nodekb' , { useNewUrlParser: true });
let db = mongoose.connection;

// Check createConnection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

//Check for errors
db.on('error', function(err){
  console.log(err);
});
// Bring in models
let Article = require('./models/article');

//set static folder
app.use(express.static(path.join(__dirname, 'node_modules'))); // bootstrap and jq
app.use(express.static(path.join(__dirname, 'public'))); // front end static
//express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
//express validator middleware
app.use(expressValidator());﻿

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Passport config
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Global user variable
app.get('*', (req, res, next)=>{
  app.locals.user = req.user || null;
  next();
});
// Home Route
app.get('/', (req, res) => {
  Article.find({}, (err, articles)=>{
    if(err) throw err;
    res.render('index', {
      title: 'Articles',
      articles: articles
    });
  });
});
// End routes

// Route files
let articles =require('./routes/articles');
let users =require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);
app.listen(80, ()=>{
  console.log("server is running on port 80");
});

// app.get('/', (req, res) => {
//   Article.find({}, (err, articles)=>{
//     if(err) throw err;
//     res.render('index', {
//       title: 'Articles',
//       articles: articles
//     });
//   });
// });
// app.get('/article/:id', (req, res)=>{
//   Article.findById(req.params.id, (err, article)=>{
//     res.render('article', {
//       article: article,
//     });
//   });
// });
// app.get('/articles/add', (req, res)=>{
//   res.render('add_article', {
//     title: 'Add Article'
//   })
// });
// app.get('/article/edit/:id', (req, res)=>{
//   Article.findById(req.params.id, (err, article)=>{
//     res.render('edit_article', {
//       title: 'Edit article',
//       article: article,
//     });
//   });
// });
// //update submit
// app.post('/articles/add', (req, res)=>{
//   req.checkBody('title', 'Title is required').notEmpty();
//   req.checkBody('author', 'Author is required').notEmpty();
//   req.checkBody('body', 'Body is required').notEmpty();
//
//   // Get errors
//   let errors = req.validationErrors();
//   if(errors){
//     res.render('add_article', {
//       title: 'Add Article',
//       errors: errors,
//     });
//   }else { // if no errors -> add article
//     let article = new Article();
//     article.title = req.body.title;
//     article.author = req.body.author;
//     article.body = req.body.body;
//     article.save((err)=>{
//       if(err) throw err;
//       req.flash('success', 'Article Added');
//       res.redirect('/');
//     })
//   }
// });
// // update submit
// app.post('/articles/edit/:id', (req, res)=>{
//   let article = {};
//   article.title = req.body.title;
//   article.author = req.body.author;
//   article.body = req.body.body;
//
//   let query = {_id:req.params.id}
//   Article.update(query, article, (err)=>{
//     if(err) throw err;
//     req.flash('success', 'Article updated');
//     res.redirect('/');
//   })
// });
// app.delete('/article/:id', (req,res)=>{
//   let query = {_id:req.params.id}
//
//   Article.remove(query, function(err){
//     if(err) throw err;
//     res.send('Success');
//   });
// });
