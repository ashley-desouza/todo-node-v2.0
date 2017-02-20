const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

// Create the express app
let app = express();

// Add Middleware
app.use(bodyParser.json());

// Add Routes and Route Handlers
app.post('/todos', (req, res) => {
    // Create model instances (i.e. documents)
    let newTodo = new Todo({
      text: req.body.text
    });

    // Save the documents
    newTodo.save()
	.then(doc => res.send(`Saved the todo doc: ${doc}`))
	.catch(err => res.send(`Error while saving the todo doc: ${err}`));
});

// Define the port on which to listen to
app.listen(3000, () => {
    console.log('Listening on port 3000');
});

/*
let newUser = new User({
  name: 'John Doe',
  email: 'johndoe@example.com'
});

newUser.save()
       .then(doc => console.log(`Saved the user doc: ${doc}`))
       .catch(err => console.log(`Error while saving the user doc: ${err}`));
*/

