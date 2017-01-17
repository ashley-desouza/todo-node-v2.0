const {MongoClient, ObjectID} = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017/TodoApp';

// Use connect method to connect to the Server
MongoClient.connect(url, (err, db) => {
  if (err) {
    return console.log('Could not connect to the mongodb server');
  }

  console.log('Successfully connected to the mongodb server');

  // Inserting documents into the collection
  // Get the documents collection
  const todosCollection = db.collection('Todos');

  todosCollection.insertOne({
    name: 'Something to do',
    completed: false
  }, (err, response) => {
    if (err) {
      return console.log('Could not insert the document', err);
    }

    console.log(JSON.stringify(response.ops, null, 2));
  });

  const usersCollection = db.collection('Users');

  usersCollection.insertOne({
    name: 'John Doe',
    age: 30,
    location: 'Somewhere'
  }, (err, response) => {
    if (err) {
      return console.log('Could not insert the document', err);
    }

    console.log(JSON.stringify(response.ops, null, 2));
  });

  // Close the connection to the server
  db.close();
});
