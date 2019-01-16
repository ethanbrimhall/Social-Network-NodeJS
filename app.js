const express = require('express');
const path = require('path');
const passport = require('passport');

// Init app
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Feed route
app.get('/', ensureAuthenticated, (req, res) =>{
  res.render('index');
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
