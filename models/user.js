var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/user-login');
var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: {
    type: String,
    bcrypt: true,
    required: true
  },
  email: {
    type: String,
  },
  name: {
    type: String
  },
  profileImage: {
    type: String
  }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) return callback(err);
    callback(null, isMatch);
  });
}
module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback) {
  var query = {username: username};
  User.findOne(query, callback);
}

module.exports.createUser = function(newUser, callback) {
  bcrypt.hash(newUser.password, 10, function(err, hash) { //10 = salt
    if(err) throw err;

    // Set hashed password
    newUser.password = hash;

    // Create user
    newUser.save(callback);
  })
  newUser.save(callback);
}
