const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

// http://mongoosejs.com/docs/guide.html
// Define the mongoose schemas
let userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Make each 'email' field unique across documents
    minlength: 1,
    trim: true,
    validate: {
    	// Use a Custom Validator. Refer - http://mongoosejs.com/docs/validation.html
    	validator: validator.isEmail,
	message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// Add Instance Methods to the Model. Refer - http://mongoosejs.com/docs/guide.html - Section marked 'Instance methods'
userSchema.methods.getAuthToken = function () {
  let user = this; // Re-assign the 'this' object to a more logical name
  let access = 'auth'; // Set the 'assign' key to the value of 'auth'
  let token = jwt.sign({_id: user._id.toHexString(), access}, 'secretsauce').toString();

  user.tokens.push({access, token}); // Add the generated token to the 'tokens' array.
  
  // Save the documents
  return user.save()
             .then(() => { return token; });
}; // Defined using the 'function' keyword because we NEED access to the 'this' object 

// Override the definition of the model's toJSON() method.
// We do this because for this model i.e. the User model, we DO NOT want to pass the 
// 'password' and 'tokens' back to the client in the response object.
// Refer http://mongoosejs.com/docs/guide.html#toJSON
userSchema.methods.toJSON = function () {
  let user = this; // Re-assign the 'this' object to a more logical name.
  let userObject = user.toObject(); // Refer - http://mongoosejs.com/docs/guide.html#toObject
  return _.pick(userObject, ['_id', 'email']);  
};

// Define the model
let User = mongoose.model('User', userSchema);

module.exports = { User };
