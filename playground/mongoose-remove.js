const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Remove all documents
// Todo.remove()
//    .then(result => console.log(result));

// Remove the document by Id
// Using the findByIdAndRemove method does return the removed document which can be useful.
// Todo.findByIdAndRemove('58ab8b55f17cbbf95f11272c')
//    .then(todo => console.log(todo));

// Remove ONE document
// Using the findOneAndRemove method does return the removed document which can be useful.
Todo.findOneAndRemove({_id: '58ab8bd9f17cbbf95f11272d'})
    .then(todo => console.log(todo));
 
