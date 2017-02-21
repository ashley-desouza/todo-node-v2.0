const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// Setup some dummy data in order to pass the GET /todos test
let todos = [{
    _id: new ObjectID(),
    text: 'First todo item'
}, {
    _id: new ObjectID(),
    text: 'Second todo item'
}];

beforeEach(done => {
    Todo.remove()
        .then(() => {
	    return Todo.insertMany(todos);
	})
	.then(() => done())
	.catch(err => done(err));
});

describe('POST /todos', () => {
    it('should create a new todo', done => {
        var text = 'This is a test todo.';

	request(app)
	  .post('/todos')
	  .send({text})
	  .expect(200)
	  .expect((res) => {
	      console.log(res.body)
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
