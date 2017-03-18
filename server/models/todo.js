const mongoose = require('mongoose');

// http://mongoosejs.com/docs/guide.html
// Define the mongoose schemas
let todoSchema = mongoose.Schema({
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number
  },
  // NOTE: The user who created the todo document, it is defined prefixed with an underscore
  _creator: {
    // http://mongoosejs.com/docs/schematypes.html
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

// Define the model
let Todo = mongoose.model('Todo', todoSchema);

module.exports = { Todo };
