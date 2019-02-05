const mongoose = require('mongoose');

// Article Schema
let articleSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  },
  body:{
    type: String,
    required: true
  },
  shorten:{
    type: String,
    required: true
  },
  usr:{
    type: String,
    required: true
  },
  date:{
    type: String,
    required: true
  },
});

let Article = module.exports = mongoose.model('Article', articleSchema);
