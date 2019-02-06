const express = require('express');
const path = require('path');
var bodyParser =require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config/database');
var paginate = require('paginate')();

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
  if(req.query.page<1){
    res.render("404");
  }
  Article.find({}, (err, articles)=>{
    if(err) throw err;
    let totalItems = articles.length, itemsPerPage = 2, pageNum=1;
    let pages = Math.ceil(totalItems/itemsPerPage);
    let page = (typeof req.query.page === 'undefined') ? 1 : req.query.page; // check if page is home(undefined) or clicked by user
    var pagination = paginate.page(totalItems, itemsPerPage, pageNum);
    // var paginationHtml = pagination.render({ baseUrl: '/' });
      res.render('index', {
        title: 'Articles',
        articles: articles,
        //paginationHtml: paginationHtml,
        page: parseInt(page),
        pages: pages,
        itemsPerPage: itemsPerPage,
      });
  });
});
// // pagination
//
// <% articles.slice().reverse().forEach(function(obj){ %>
// <div class="card mb-4">
//   <img class="card-img-top" src="http://placehold.it/750x300" alt="Card image cap">
//   <div class="card-body">
//     <h2 class="card-title"><%= obj.title%></h2>
//     <p class="card-text"><%= obj.shorten %></p>
//     <a href="/articles/<%= obj.id %>" class="btn btn-primary">Read More &rarr;</a>
//   </div>
//   <div class="card-footer text-muted">
//     Posted on <%= obj.date %> by
//     <a href="#"><%= obj.usr %></a>
//   </div>
// </div>
// <%  }); %>


// End routes

// Route files
let articles =require('./routes/articles');
let users =require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);
app.listen(3000, ()=>{
  console.log("server is running on port 3000");
});
