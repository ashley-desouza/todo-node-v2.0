require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

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
	    res.send(doc);
	})
	.catch(err => res.status(400).send(err));
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

// Route to create a new user item
app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']); // ONLY pick the 'email' and 'password' parameters from the request body

    // Create model instances (i.e. documents)
    let newUser = new User(body); // This is an interesting way of passing a JavaScript object.

    // Save the documents
    newUser.save()
	.then(() => {
	    // Generate the token to be sent back to the user
	    return newUser.getAuthToken();
	})
	.then(token => {
	    res.header('x-auth', token).send(newUser);
	})
	.catch(err => res.status(400).send(err));
});

// Route for user authentication
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// Route to login a user
app.post('/users/login', (req, res) => {
    // Extract the email and password from the request object
    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password)
        .then(user => {
	    // Generate the token to be sent back to the user
	    return Promise.all([user, user.getAuthToken()]);
	})
	.then(results => res.header('x-auth', results[1]).send(results[0]))
	.catch(err => res.status(400).send());
});


// Define the port on which to listen to
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

module.exports = {app};
