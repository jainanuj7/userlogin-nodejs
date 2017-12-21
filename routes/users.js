var express = require('express');
var multer = require('multer');
var upload = multer({ dest: './uploads' })
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {title: 'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'});
});

router.post('/register', upload.single('profileimage'), function (req, res, next) {
  // Get the form values
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  // Check for image field
  if(req.file) {
    console.log('Uploading file...');

    // File info
    var profileImageOriginalName = req.file.originalname;
    var profileImageName = req.file.name;
    var profileImageMime = req.file.mimetype;
    var profileImagePath = req.file.path;
    var profileImageExt = req.file.extension;
    var profileImageSize = req.file.size;
  } else {
    var profileImageName = 'noimage.png';
  }

  // Form Validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email not valid').isEmail();
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  // Check for errors
  var errors = req.validationErrors();
  if(errors) {
    res.render('register', {
      errors: errors,
      name: name,
      email: email,
      username: username,
      password: password,
      password2: password2
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileImage: profileImageName
    });

    // Create Use
    User.createUser(newUser , function(err, user) {
      if(err) throw err;
      console.log(user);
    });

    // Success message
    req.flash('success','You are now registered and may login!');
    res.location('/');
    res.redirect('/');
  }
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
      if(err) throw err;
      if(!user) {
        console.log('Unknown user');
        return done(null, false, {message: 'Unknown user'});
      }

      User.comparePassword(password, user.password, function(err, isMatch) {
        if(err) throw err;
        if(isMatch) {
          return done(null, user);
        } else {
          console.log('Invalid password!');
          return done(null, false, {message: 'Invalid password!'});
        }

      })
    });
  }
));

router.post('/login', passport.authenticate('local', { failiurRedirect: '/users/login', failiureFlash: 'Invalid username or password.'}), function(req, res) {
  console.log('Authentication successful!');
  req.flash('Success! You are logged in');
  res.redirect('/')
});

router.get('/logout', function(req, res) {
  req.logout;
  req.flash('success', 'You have logged out!');
  res.redirect('/users/login');
})
module.exports = router;
