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
  var posts = getPosts(req.user);
  console.log(posts);
  res.render('index', {
    posts:posts
  });
});

app.post('/', ensureAuthenticated, (req, res) =>{

  let user = {};
  user.posts = req.user.posts;

  let newPost = {
    "text":req.body.post,
    "likes": "0",
    "comments": [],
    "name":req.user.name,
    "username":req.user.username,
    "timestamp": Date.now().toString()
  };

  user.posts.push(newPost);

  User.updateOne({username:req.user.username}, user, function(err){
    if(err){
      console.log(err);
      return;
    }else{
      req.flash('success', 'Post Added!');
      var posts = getPosts(req.user);
      return res.render('index', {
        user:req.user,
        posts:posts
      });
    }
  });
});

function getPosts(user){
  var posts = [];
  for(var i = user.posts.length - 1; i >= 0; i--){
    posts.push(user.posts[i]);
  }
  for(var i = 0; i < user.friends.length; i++){
    let query = {username:user.friends[i]};
    User.findOne(query, function(err, theuser){
      if(err) throw err;

      if(theuser){
        if(theuser.posts.length > 0){
          for(var j = theuser.posts.length - 1; j >= 0; j--){
            var currentPost = theuser.posts[j];
            posts.push(currentPost);
          }
        }
      }
    });
  }

  return posts;

}

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
