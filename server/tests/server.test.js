const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', done => {
        var text = 'This is a test todo.';

	request(app)
	  .post('/todos')
	  .send({text})
	  .expect(200)
	  .expect((res) => {
	      expect(res.body.text).toBe(text);
	  })
	  .end((err, res) => {
	      if (err) {
	          return done(err);
	      }

	      Todo.find({text})
	          .then(todos => {
		      expect(todos.length).toBe(1);
		      expect(todos[0].text).toBe(text)
		      done();
		  })
		  .catch(err => done(err));
	  });
    });

    it('should not create a new todo with invalid body data', done => {
        request(app)
	  .post('/todos')
	  .send({})
	  .expect(400)
	  .end((err, res) => {
	      if (err) {
	          return done(err);
	      }

	      Todo.find()
	          .then(todos => {
		      expect(todos.length).toBe(2);
		      done();
		  })
		  .catch(err => done(err));
	  });
    });
});

describe('GET /todos', () => {
    it('should return all todo items', done => {
        request(app)
	  .get('/todos')
	  .expect(200)
	  .expect(res => {
	      expect(res.body.todos.length).toBe(2);
	  })
	  .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return the todo item specified by the id', done => {
        request(app)
	  .get(`/todos/${todos[0]._id.toHexString()}`)
	  .expect(200)
	  .expect(res => {
	      expect(res.body.todo.text).toBe(todos[0].text);
	  })
	  .end(done);
    });

    it('should return 404 if todo not found', done => {
        let hexId = new ObjectID().toHexString();
        request(app)
	  .get(`/todos/${hexId}`)
	  .expect(404)
	  .end(done);
    });

    it('should return 404 for non-object ids', done => {
        request(app)
	  .get(`/todos/123`)
	  .expect(404)
	  .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should delete the todo item specified by the id', done => {
        let hexId = todos[1]._id.toHexString();

	request(app)
	  .delete(`/todos/${hexId}`)
	  .expect(200)
	  .expect(res => {
	      expect(res.body.todo._id).toBe(hexId);
	  })
	  .end((err, res) => {
	      if (err) {
	          done(err);
	      }

	      Todo.findById(res.body.todo._id)
	          .then(todo => {
		      expect(todo).toNotExist();
		      done();
		  })
		  .catch(err => done(err));
	  });
    });

    it('should return a 404 if the todo is not found', done => {
        let hexId = new ObjectID().toHexString();

	request(app)
	  .delete(`/todos/${hexId}`)
	  .expect(404)
	  .end(done);
    });

    it('should return a 404 for invalid todo ids.', done => {
        request(app)
	  .delete('/todos/123abcd')
	  .expect(404)
	  .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should set the completedAt value when todo is completed', done => {
        var hexId = todos[0]._id.toHexString();

	request(app)
	  .patch(`/todos/${hexId}`)
	  .send({
	    text: 'First todo item has been updated',
	    completed: true
	  })
	  .expect(200)
	  .expect(res => {
	      expect(res.body.todo.text).toBe('First todo item has been updated');
	      expect(res.body.todo.completed).toBe(true);
	      expect(res.body.todo.completedAt).toBeA('number');
	  })
	  .end(done);
    });

    it('should clear the completedAt value when todo is not completed', done => {
        var hexId = todos[1]._id.toHexString();

	request(app)
	  .patch(`/todos/${hexId}`)
	  .send({
	    text: 'Second todo item has been updated',
	    completed: false
	  })
	  .expect(200)
	  .expect(res => {
	      expect(res.body.todo.text).toBe('Second todo item has been updated');
	      expect(res.body.todo.completed).toBe(false);
	      expect(res.body.todo.completedAt).toNotExist();
	  })
	  .end(done);
    });
});

describe('GET /users/me', () => {
    it('should authenticate the user', done => {
        request(app)
	  .get('/users/me')
	  .set('x-auth', users[0].tokens[0].token) // The 'set' method is used to set a header in the requust object
	  .expect(200)
	  .expect(res => {
	      // Since, this API returns an object containing the _id and email, let us check if those 
	      expect(res.body._id).toBe(users[0]._id.toHexString());
	      expect(res.body.email).toBe(users[0].email);
	  })
	  .end(done);
    });

    it('should return an unauthenticated user message', done => {
        request(app)
	  .get('/users/me')
	  .expect(401)
	  .expect(res => {
	      // Assert an Empty Object has been returned. In the 'expect' library, comparing Objects is done using the toEqual() method
	      expect(res.body).toEqual({});
	  })
	  .end(done);
    });
});

describe('POST /users', _ => {
    it('should create a new user', done => {
	// Provide user credentials for this test
	let email = 'user@exampleuser.com';
	let password = 'newUserPass!';

        request(app)
	  .post('/users')
	  .send({
	    email: email,
	    password: password
	  })
	  .expect(200)
	  .expect(res => {
	      // Assert - 
	      //    1. The response body has a header called 'x-auth'
	      //    2. The response body has a '_id' property
	      //    3. The response body has an 'email' property that matches the email variable.
	      expect(res.headers['x-auth']).toExist();
	      expect(res.body._id).toExist();
	      expect(res.body.email).toBe(email);
	  })
	  .end(err => {
	      if (err) {
	          return done(err);
	      }

	      // Check if the document is available in the database
	      User.findOne({email})
	          .then(user => {
		    // Assert -
		    //    1. The 'user' document has been retrieved and returned.
		    //    2. The 'password' property of the 'user' document should NOT equal to the 'password' variable. 
		    //       This is because the 'password' property is a hashed value and the 'password' variable is a string.
		    expect(user).toExist();
		    expect(user.password).toNotBe(password);

		    done();
		  })
		  .catch(err => done(err));
	  });
    });

    it('should return validation errors if request invalid', done => {
        let email = 'abc';
	let password = 'pass';

	request(app)
	  .post('/users')
	  .send({email, password})
	  .expect(400)
	  .end(done);
    });

    it('should not create a new user if email in use', done => {
	// Use an existing email from the seed data
        let email = users[0].email;
	let password = 'newUserPass@';

        request(app)
	  .post('/users')
	  .send({email, password})
	  .expect(400)
	  .end(done);
    });
});

describe('POST /users/login', _ => {
    it('should login the user', done => {
        // Use a valid user from the seed data
	let email = users[1].email;
	let password = users[1].password;

	request(app)
	  .post('/users/login')
	  .send({email, password})
	  .expect(200)
	  .expect(res => {
	      // Assert -
	      //    1. The 'x-auth' header has been received
	      //    2. The response body includes a object that includes 'access' and 'token' properties
	      //    3. Query the database and confirm that the user document returned has a token which matches what is in the 'x-auth' header

	      expect(res.headers['x-auth']).toExist();
	  })
	  .end((err, res) => {
	      if (err) {
	          return done(err);
	      }

	      // Assert - 
	      //    1. Query the database and -
	      //        a. Confirm that the returned document includes a object that includes 'access' and 'token' properties

              User.findById(users[1]._id)
	          .then(user => {
		      expect(user.tokens[0]).toInclude({
		          access: 'auth',
			  token: res.headers['x-auth']
		      });

		      done();
		  })
		  .catch(err => done(err));
	  });
    });

    it('should not login the user with invalid credentials', done => {
        // Use invalid login credentials
	let email = users[1].email;
	let password = users[1].password + '1';

	request(app)
	  .post('/users/login')
	  .send({email, password})
	  .expect(400)
	  .expect(res => {
	      expect(res.headers['x-auth']).toNotExist();
	  })
	  .end((err, res) => {
	      if (err) {
	          done(err);
	      }

	      User.findById(users[1]._id)
	          .then(user => {
		      expect(user.tokens.length).toBe(0);
		      done();
		  })
		  .catch(err => done(err));
	  });
    
    });
});
