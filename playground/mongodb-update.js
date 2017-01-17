const {MongoClient, ObjectID} = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017/TodoApp';

// Use connect method to connect to the Server
MongoClient.connect(url, (err, db) => {
  if (err) {
    return console.log('Could not connect to the mongodb server');
  }

  console.log('Successfully connected to the mongodb server');

  // Update documents from the collection
  // Get the documents collection
  const usersCollection = db.collection('Users');
  const todosCollection = db.collection('Todos');

  // Find a document and then update it
  // http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#findOneAndUpdate
  // findOneAndUpdate(filter, update, options, callback)
  usersCollection.findOneAndUpdate({ _id: new ObjectID('587d7008d66770259841559d') }, 
                                   { $inc: { age: 1 } },
                                   { returnOriginal: false })
                 .then(results => {
                   console.log(JSON.stringify(results, null, 2));
                 })
                 .catch(err => console.log(`Unable to update the record: ${err}`));

  todosCollection.findOneAndUpdate({ name: 'Eat Lunch' }, 
                                   { $set: { completed: true } },
                                   { returnOriginal: false })
                 .then(results => console.log(JSON.stringify(results, null, 2)))
                 .catch(err => console.log(`Unable to update the record ${err}`));
  // Close the connection to the server
  db.close();
});
