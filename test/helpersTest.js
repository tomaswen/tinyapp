const { assert } = require('chai');
const bcrypt = require('bcrypt');
const {
   generateRandomString,
   checkIfEmailIsInUserDatabase,
   fetchUserID,
   isPasswordCorrect,
   getUserURL
 } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};
const urlDatabase = {
   b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
   i3BoGr: { longURL: "https://www.facebook.com", userID: "user2RandomID" },
   b6UTx1: { longURL: "https://www.youtube.ca", userID: "user2RandomID" },
   i3BoG2: { longURL: "https://www.google.ca", userID: "user2RandomID" },
 };

describe('checkIfEmailIsInUserDatabase', function() {
  it('should return true if user name is in the database', function() {
    const user = checkIfEmailIsInUserDatabase(testUsers, "user@example.com")
    assert.isTrue(user, "Email is not in the database")
  });
  it('should return false if user name is not in the database', function() {
   const user = checkIfEmailIsInUserDatabase(testUsers, "use@example.com")
   assert.isFalse(user, "Email is not in the database")
 });
});
describe('generateRandomString', function() {
   it('string generated should have a length of 6', function() {
     const string = generateRandomString()
     assert.lengthOf(string, 6)

   });
 });
 describe('fetchUserID', function() {
   it('should fetch the user id given an email', function() {
     const user = fetchUserID(testUsers, "user@example.com")
     assert.equal(user, "userRandomID")

   });
 });
 describe('isPasswordCorrect', function() {
   it('should return true if password matches', function() {
     const password = "purple-monkey-dinosaur";
     const theBoolean = isPasswordCorrect(testUsers, "userRandomID" , password)
     assert.isTrue(theBoolean, "Password matches")

   });
 });
 describe('getUserURL', function() {
   it('should get { longURL: "https://www.tsn.ca", userID: "userRandomID" }', function() {
     const newObj = getUserURL(urlDatabase, "userRandomID");
     assert.deepEqual(newObj, { b6UTxQ: 'https://www.tsn.ca' });
   });
 });