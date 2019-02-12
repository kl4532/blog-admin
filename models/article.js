const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
// Article Schema
let articleSchema = mongoose.Schema({
  title:{
    type: String,
    required: true,
  },
  author:{
    type: String,
    required: true,
  },
  body:{
    type: String,
    required: true,
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
    required: true,
  },
  category: {
    type: { name: String },
    required: true,
  },
  comment: {
    type: {
      name: String,
      comment: String,
      created: String,
      id: String,
    },
    required: false,
  }
});

let Article = module.exports = mongoose.model('Article', articleSchema);
