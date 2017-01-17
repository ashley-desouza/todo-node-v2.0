const {MongoClient, ObjectID} = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017/TodoApp';

// Use connect method to connect to the Server
MongoClient.connect(url, (err, db) => {
  if (err) {
    return console.log('Could not connect to the mongodb server');
  }

  console.log('Successfully connected to the mongodb server');

  // Deleting documents from the collection
  // Get the documents collection
  const usersCollection = db.collection('Users');

  // Find a document and then delete it
  usersCollection.findOneAndDelete({_id: new ObjectID('587d6f346363958ceda779b1')})
                 .then(results => {
                   console.log(results);
                 })
                 .catch(err => console.log(`Unable to delete record: ${err}`));

  // Delete Many
  usersCollection.deleteMany({ name: 'John Doe' }).then(results => console.log(results));

  // Close the connection to the server
  db.close();
});
