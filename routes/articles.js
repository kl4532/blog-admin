const express = require('express');
const router = express.Router();

// Bring in models
let Article = require('../models/article');
// User model
let User = require('../models/user');

router.get('/add', ensureAuthenticated, (req, res)=>{
  res.render('add_article', {
    title: 'Add Article'
  })
});
router.get('/edit/:id', ensureAuthenticated, (req, res)=>{
  Article.findById(req.params.id, (err, article)=>{
    if(article.author != req.user._id){
      req.flash('danger', ' Not Authorized');
      res.redirect('/');
    }
    res.render('edit_article', {
      title: 'Edit article',
      article: article,
    });
  });
});
//update submit
router.post('/add', (req, res)=>{
  req.checkBody('title', 'Title is required').notEmpty();
  //req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Text is too short').isLength({ min: 50 });

  // Get errors
  let errors = req.validationErrors();
  if(errors){
    res.render('add_article', {
      title: 'Add Article',
      errors: errors,
    });
  }else { // if no errors -> add article
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    article.usr = req.user.username;
    article.shorten = article.body.replace(/(([^\s]+\s\s*){20})(.*)/,"$1…"); // take first 20 words
    article.date = currDate();
    article.save((err)=>{
      if(err) throw err;
      req.flash('success', 'Article Added');
      res.redirect('/');
    })
  }
});
// update submit
router.post('/edit/:id', ensureAuthenticated, (req, res)=>{
  let article = {};
  article.title = req.body.title;
  article.author = req.user._id;
  article.body = req.body.body;

  let query = {_id:req.params.id}
  Article.updateOne(query, article, (err)=>{
    if(err) throw err;
    req.flash('success', 'Article updated');
    res.redirect('/');
  })
});
router.delete('/:id', (req,res)=>{
  if(!req.user._id){
    res.status(500).send();
  }
  let query = {_id:req.params.id}

  Article.findById(req.params.id, (err, article)=>{
    if(article.author != req.user.id){
      res.status(500).send();
    }else{
      Article.deleteOne(query, function(err){
        if(err) throw err;
        res.send('Success');
      });
    }
  })
});
router.get('/:id', (req, res)=>{
  Article.findById(req.params.id, (err, article)=>{
    User.findById(article.author, (err, user)=>{
      res.render('article', {
        article: article,
        author: user.name
      });
    });
  });
});

// Access control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else{
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}
module.exports = router;

function currDate(){
  var d = new Date();
  datetime = d.getDate() + '/' + (1+ d.getMonth()) + '/' + d.getFullYear() + ', ' + d.getHours() + ':' + d.getMinutes();
  return datetime;
}
