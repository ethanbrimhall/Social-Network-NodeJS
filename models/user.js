const mongoose = require('mongoose');

// User schema
const userSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  age:{
    type: String,
    required: true
  },
  relationship:{
    type: String,
    required: true
  },
  job:{
    type: String,
    required: true
  },
  education:{
    type: String,
    required: true
  }
});

const User = module.exports = mongoose.model('User', userSchema);
