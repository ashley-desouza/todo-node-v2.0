const mongoose = require('mongoose');

// Setup mongoose to use Promises
// Define mongoose to use the native JavaScript Promise implementation
mongoose.Promise = global.Promise;

// http://mongoosejs.com/docs/index.html
// Connect to the database
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp';

mongoose.connect(url);

module.exports = { mongoose };
