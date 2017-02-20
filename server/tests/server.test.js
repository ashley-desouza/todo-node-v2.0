const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// Setup some dummy data in order to pass the GET /todos test
let todos = [{
    text: 'First todo item'
}, {
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
