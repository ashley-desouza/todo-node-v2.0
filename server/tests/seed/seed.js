const {ObjectID} = require('mongodb');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');

// Setup some dummy data in order to pass the GET /todos test
let userOneId = new ObjectID();
let userTwoId = new ObjectID();

let users = [{
  _id: userOneId,
  email: 'user1@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'secretsauce').toString()
  }]}, {
    _id: userTwoId,
    email: 'user2@example.com',
    password: 'userTwoPass'
  }];

let todos = [{
  _id: new ObjectID(),
  text: 'Eat Lunch'
}, {
  _id: new ObjectID(),
  text: 'Complete NodeJS app',
  completed: true,
  completedAt: 553
}];

let populateTodos = done => {
  Todo.remove()
      .then(() => Todo.insertMany(todos))
      .then(() => done())
      .catch(err => done(err));
};

let populateUsers = done => {
  User.remove()
      .then(() => {
        let userOne = new User(users[0]).save(); // userOne is a Promise Object
	let userTwo = new User(users[1]).save(); // userTwo is a Promise Object

	// Combine the 2 Promise Objects and execute them in parellel
	return Promise.all([userOne, userTwo]); // Promise.all() returns a Promise
      })
      .then(() => done())
      .catch(err => done(err));
};

module.exports = {todos, populateTodos, users, populateUsers};
