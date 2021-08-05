const { assert } = require('chai');
const e = require('express');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    console.log(user);
    assert.equal(user.id, expectedOutput);
  });

  it('should return a user object with a valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutput = {
      id: 'userRandomID',
      email: 'user@example.com',
      password: 'purple-monkey-dinosaur'
    }
    console.log(user);
    assert.deepEqual(user, expectedOutput);
  });

  it('should return undefined when passed invalid email', function() {
    const user = getUserByEmail('sobrock@hello.com', testUsers);
    const expectedOutput = undefined;

    console.log(user);
    assert.equal(user, expectedOutput);
  });
});