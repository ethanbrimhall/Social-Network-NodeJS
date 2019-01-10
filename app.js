const express = require('express');
const path = require('path');

// Init app
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Feed route
app.get('/', (req, res) =>{
  res.render('index');
});

app.listen(3000, () => {
  console.log('Server Started on port 3000');
});
