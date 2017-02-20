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
	.then(doc => {
	    console.log(`Saved the todo doc: ${doc}`);
	    res.send(doc);
	})
	.catch(err => res.status(400).send(err));
});

// Define the port on which to listen to
app.listen(3000, () => {
    console.log('Listening on port 3000');
});

module.exports = {app};
