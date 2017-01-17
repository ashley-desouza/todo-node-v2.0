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

  todosCollection.find({_id: new ObjectID('587d32a2d6212024b9487f18')})
                 .toArray()
                 .then(docs => {
                   console.log(JSON.stringify(docs, null, 2)); 
                 })
                 .catch(err => console.log(`Unable to find record: ${err}`));

  todosCollection.find().count().then(docs => console.log(`Todos Count: ${JSON.stringify(docs, null, 2)}`)).catch(err => console.log('No records returned'));
  // Close the connection to the server
  db.close();
});
