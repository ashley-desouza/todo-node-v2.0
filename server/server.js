let env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

// Create the express app
let app = express();
const port = process.env.PORT;

// Add Middleware
app.use(bodyParser.json());

// Add Routes and Route Handlers
// Route to create a new todo item
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
	.catch(err => res.sendStatus(400).send(err));
});

// Route to get all todo items
app.get('/todos', (req, res) => {
    Todo.find()
        .then(todos => res.send({todos}))
	.catch(err => res.sendStatus(400).send(err));
});

// Route to get a todo item by ID
app.get('/todos/:id', (req, res) => {
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.sendStatus(404).send();
    }

    Todo.findById(id)
        .then(todo => {
	    if (!todo) {
	        return res.sendStatus(404).send();
	    }
	    res.send({todo});
	})
	.catch(err => res.sendStatus(400).send());
});

// Route to delete a todo item by ID
app.delete('/todos/:id', (req, res) => {
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.sendStatus(404).send();
    }

    Todo.findByIdAndRemove(id)
        .then(todo => {
	    if (!todo) {
	        return res.sendStatus(404).send();
	    }

	    res.send({todo});
	})
	.catch(err => res.sendStatus(400).send());
});

// Route to update a todo item by ID
app.patch('/todos/:id', (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['text', 'completed']); // ONLY pick the 'text' and 'completed' parameters from the request body

    if (!ObjectID.isValid(id)) {
        return res.sendStatus(404).send();
    }

    // Update the 'completedAt' property based on the 'completed' property
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completedAt = null;
	body.completed = false;
    }

    // Search for the todo item by ID
    // http://mongoosejs.com/docs/documents.html
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
        .then(todo => {
	    if(!todo) {
	    	return res.sendStatus(404).send();
	    }
	    res.send({todo});
	})
	.catch(err => res.sendStatus(404).send());
});

// Define the port on which to listen to
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

module.exports = {app};
