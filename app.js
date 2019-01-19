const express = require('express');
const path = require('path');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const config = require('./config/database')

mongoose.connect(config.database);
let db = mongoose.connection;

let User = require('./models/user');

// Check DB connection
db.once('open', () =>{
  console.log('connected to mongoDB');
});

// Check for DB errors
db.on('error', () =>{
  console.log(err);
});

// Init app
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

// Express Session middleware
app.use(session({
  secret: "mysecret123",
  resave: true,
  saveUninitialized: true
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;

    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg: msg,
      value: value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) =>{
  res.locals.user = req.user || null;
  next();
});

// Feed route
app.get('/', ensureAuthenticated, (req, res) =>{
  res.render('index');
  //Go through all friends and gather their last 10 posts and put into one array
  //Sort array by timestamp, newest to oldest
});

app.post('/', ensureAuthenticated, (req, res) =>{

  let user = {};
  user.posts = req.user.posts;

  let newPost = {
    "text":req.body.post,
    "likes": "0",
    "comments": [],
    "timestamp": Date.now().toString()
  };

  user.posts.push(newPost);

  User.updateOne({username:req.user.username}, user, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      req.flash('success', 'Post Added!');
      return res.render('index', {
        user:req.user
      });
    }
  });


});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/users/login');
  }
}

let users = require('./routes/users');
app.use('/users', users);

app.listen(3000, () => {
  console.log('Server Started on port 3000');
});
