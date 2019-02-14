const express = require('express');
const router = express.Router();
var paginate = require('paginate')();

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
  req.checkBody('category', 'Category is required').notEmpty();

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
    article.category = req.body.category;
    article.usr = req.user.username;
    article.shorten = article.body.replace(/(([^\s]+\s\s*){20})(.*)/,"$1…"); // take first 20 words
    article.date = currDate();
    let upFile = req.files.upFile;
    if(upFile){
      article.imgName = article.author+article.title;
      console.log(article.imgName);
      article.img = true;
      upFile.mv(`./public/images/${article.imgName}.jpg`,false);
    }

    // Use the mv() method to place the file somewhere on your server

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
  article.category = req.body.category;
  article.usr = req.user.username;
  article.shorten = article.body.replace(/(([^\s]+\s\s*){20})(.*)/,"$1…"); // take first 20 words
  article.date = currDate();
  let query = {_id:req.params.id}
  let upFile = req.files.upFile;
  if(upFile){
    article.imgName = article.author+article.title;
    article.img = true;
    console.log(article.imgName);
    upFile.mv(`./public/images/${article.imgName}.jpg`,false);
  }
  Article.updateOne(query, article, (err)=>{
    if(err) throw err;
    req.flash('success', 'Article updated');
    res.redirect('/');
  })
});
router.delete('/', ensureAuthenticated, (req,res)=>{
  let id = req.query.id;
  let cid = parseInt(req.query.cid);
  // if(!req.user._id){
  //   res.status(500).send();
  // }s
  //console.log(`id: ${id}, cid: ${cid}`);
  let query = {_id:id}
  if(isNaN(cid)){ // delete article
    Article.findById(id, (err, article)=>{
      // if(article.author != req.user.id){
      //   res.status(500).send();
      // }else{
        Article.deleteOne(query, function(err){
          if(err) throw err;
          res.send('Success');
        });
      // }
    })
  }else{ // delete comment
    Article.updateOne({_id: id}, { $pull: {"comment" : {id: cid}}}, function(err){
      if(err) throw err;
      res.send('Success');
    });
  }
});
router.get('/:id', (req, res)=>{
  Article.findById(req.params.id, (err, article)=>{
    if(article){
      console.log(article.author);
      User.findById(article.author, (err, user)=>{
        res.render('article', {
          article: article,
          //author: user.name
          author: article.usr
        });
      });
    }else{res.render('404');};
  });
});
router.post('/search', (req, res)=>{
  req.checkBody('search', 'No result').notEmpty();
  // Get errors
  Article.find({$text : { $search: `"${req.body.search}"`}}, (err, articles)=>{
    if(err) throw err;
    let totalItems = articles.length, itemsPerPage = 6, pageNum=1;
    let pages = Math.ceil(totalItems/itemsPerPage);
    let page = (typeof req.query.page === 'undefined') ? 1 : req.query.page; // check if page is home(undefined) or clicked by user
    var pagination = paginate.page(totalItems, itemsPerPage, pageNum);
    // var paginationHtml = pagination.render({ baseUrl: '/' });
      res.render('index', {
        title: 'Articles',
        articles: articles,
        page: parseInt(page),
        pages: pages,
        itemsPerPage: itemsPerPage,
        currCat: "all",
      });
    });
});
router.post('/add-comment/:id', function(req, res) {
  req.checkBody('name', 'Your name is required').notEmpty();
  req.checkBody('comment', 'Text in comment missing...').notEmpty();
  let errors = req.validationErrors();
  let id = req.params.id;
  let d = new Date();
  if(errors){
    res.render(`/articles/${id}`, {
      errors: errors,
    });
  }else{
    let new_comment = {
        name: req.body.name,
        comment: req.body.comment,
        created: currDate(),
        id: d.getTime(),
        admin: req.body.admin,
    };
    Article.updateOne({_id:req.params.id}, {$push: { comment: new_comment }}, (err)=>{
      if(err) throw err;
      req.flash('success', 'Comment added');
      res.redirect(`/articles/${id}`);
    })
  }
});
// router.get('/comment/', (req,res)=>{ // delete comment
//   const id = req.query.id; // article id
//   const cid = parseInt(req.query.cid); // comment id
//       Article.updateOne({_id: id}, { $pull: {"comment" : {id: cid}}}, function(err){
//         if(err) throw err;
//         res.redirect(`/articles/${id}`);
//       });
// });

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
  datetime = d.getDate() + '/' + (1+ d.getMonth()) + '/' + d.getFullYear() + ', ' + d.getHours() + ':' + (d.getMinutes()<10?'0':'')+ d.getMinutes();
  return datetime;
}
