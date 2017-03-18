const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

/*------------------------------ Schema ------------------------------ */
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

/*------------------------------ Model Methods ------------------------------ */
// Add Model Methods to the Schema. Refer - http://mongoosejs.com/docs/guide.html#statics
userSchema.statics.findByToken = function (token) {
  let User = this; // Re-assign the 'this' object to a more logical name. NOTE that here we are using upper case 'U' as in 'User'
  let decoded; // Leave this variable as undefined as we want to place the results of the jwt.verify operation in a try-catch block.

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    // Return a Promise in reject state
    /*
      return new Promise((resolve, reject) => {
        reject();
      });
    */

    // How about doing it this way
    return Promise.reject();
  }

  // Query the collection for the document using findOne
  // Return Promise
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

userSchema.statics.findByCredentials = function (email, password) {
  let User = this;

  return User.findOne({email})
             .then(user => {
	         // Check if the 'user' document is retrieved and available 
	         if(!user) {
		   return Promise.reject();
		 }

                 // Because the 'bcrypt.compare()' method works only with callbacks and we want to maintain our consistent use of Promises
		 // we must wrap the bcrypt.compare() method in a Promise
		 return new Promise((resolve, reject) => {
		     bcrypt.compare(password, user.password, (err, res) => {
		         if(res) {
			     resolve(user);
			 }

			 reject();
		     });
		 });

	     });
};

/*------------------------------ Instance Methods ------------------------------ */
// Add Instance Methods to the Schema. Refer - http://mongoosejs.com/docs/guide.html - Section marked 'Instance methods'
userSchema.methods.getAuthToken = function () {
  let user = this; // Re-assign the 'this' object to a more logical name
  let access = 'auth'; // Set the 'assign' key to the value of 'auth'
  let token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

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

// Method to remove a token
userSchema.methods.removeToken = function (token) {
    let user = this; // Re-assign the 'this' object to a more logical name

    // Update the specific user document
    // http://mongoosejs.com/docs/api.html#model_Model.update
    return user.update({
               // https://docs.mongodb.com/manual/reference/operator/update/pull/
               $pull: {
	           tokens: {
	               token: token
	           }
	       }
           });
}

/*------------------------------ Mongoose Middleware ------------------------------ */
// IMP - Add mongoose middleware so that we hash the password ONLY WHEN THE PASSWORD PROPERTY HAS BEEN MODIFIED.
// Refer http://mongoosejs.com/docs/middleware.html
userSchema.pre('save', function (next) {
  let user = this; // Re-assign the 'this' object to a more logical name.

  // THIS IS VERY IMP - We only want to modify the password hash when we are saving a document and the 'password'
  // is one of the properties that has been modified.
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => { // Generate the salt
      bcrypt.hash(user.password, salt, (err, hash) => { // Generate the password hash
        user.password = hash;
	next();
      });
    });
  } else {
    next();
  }
});

/*------------------------------ Model ------------------------------ */
// Define the model
let User = mongoose.model('User', userSchema);

module.exports = { User };
