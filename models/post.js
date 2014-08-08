var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var postSchema = mongoose.Schema({
  username: String,
  title: String,
  date: { type: Date, default: Date.now },
  content: String,
  wordsCount: Number
});

module.exports = mongoose.model('Post', postSchema);