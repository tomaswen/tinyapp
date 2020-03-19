const bcrypt = require('bcrypt');
//-----------------------HELPER-FUNCTIONS--------------------------
// GENERATES A RANDOM 6DIGIT STRING
const generateRandomString = () => {
  let randomStr = '';
  let charString = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i <= 5; i++) {
    let randomIndex = Math.floor(Math.random() * 61);
    randomStr += charString.charAt(randomIndex);
  }
  return randomStr;
};
//CHECKS IN THE EMAIL IS IN THE USERS DATABASE
const checkIfEmailIsInUserDatabase = (database, emailToCheck) => {
  for (let user in database) {
    if (database[user].email === emailToCheck) {
      return true;
    }
  }
  return false;
};
// FETCH userId FROM DATABASE USING EMAIL
const fetchUserID = (database, email) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
};
//CHECKS IF PASSWORD MATCHES TO THE ONE IN DATABASE GIVEN AN ID
const isPasswordCorrect = (database, id, password) => {
  if (bcrypt.compareSync(password, database[id].password)) {
    return true;
  }
  return false;
};
// RETURNS AN OBJECT WITH SHORT URL AND LONG URL THAT MATCHES THE ID
const getUserURL = (database, searchingUserID) => { //<------ Equivalent to urlsForUser(id)
  let userURLs = {};
  for (let site in database) {
    if (database[site].userID === searchingUserID) {
      userURLs[site] = database[site].longURL;
    }
  }
  return userURLs;
};

module.exports = {
  generateRandomString,
  checkIfEmailIsInUserDatabase,
  fetchUserID,
  isPasswordCorrect,
  getUserURL
};