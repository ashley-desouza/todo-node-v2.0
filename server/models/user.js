const mongoose = require('mongoose');

// http://mongoosejs.com/docs/guide.html
// Define the mongoose schemas
let userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completedAt: {
    type: Number
  }
});

// Define the model
let User = mongoose.model('User', userSchema);

module.exports = { User };
