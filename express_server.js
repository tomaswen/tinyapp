const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//----------------------URL-DATABASE---------------------

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.facebook.com", userID: "user2RandomID" },
  b6UTx1: { longURL: "https://www.youtube.ca", userID: "userRandomID" },
  i3BoG2: { longURL: "https://www.google.ca", userID: "user2RandomID" },
};

//----------------------USER-DATABASE---------------------

const users = {
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

//-----------------------FUNCTIONS--------------------------
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

const getUserURL = (database, searchingUserID) => { //<------ Equivalent to urlsForUser(id)
  let userURLs = {};
  for (let site in database) {
    if (database[site].userID === searchingUserID) {
      userURLs[site] = database[site].longURL;
    }
  }
  return userURLs;
};
//----------------------REQUESTS-------------------------

//HOMEPAGE
app.get("/", (req, res) => {
  res.redirect("/urls");
  
});
//SENDS A HTML RESPONSE OF THE URLS IN THE DATABASE
app.get("/urls", (req,res) => {
  if (req.session.userId) {
    const newUrlDatabase = getUserURL(urlDatabase, req.session.userId);
    let templateVars = { urls: newUrlDatabase , users: users[req.session.userId]};
    res.render("urls_index", templateVars);
  } else {
    let templateVars = { urls: "" , users: ""};
    res.render("urls_index", templateVars);
  //   res.redirect("/login");
  }
});
//SENDS HTML RESPONSE TO ADD NEW URL TO THE DATABASE
app.get("/urls/new", (req, res) => {
  if (req.session.userId) {
    let templateVars = { users: users[req.session.userId]};
    res.render("urls_new",templateVars);
  } else {
    res.redirect("/");
  }
});
//SENDS HTML RESPONSE TO SHOW THE SPECIFIC SITE AND ITS SHORTENED URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users: users[req.session.userId]};
  res.render("urls_show", templateVars);
});
// AFTER POSTING/ADDING URL IT WILL REDIRECT BACK TO THE URL/:ID
app.post("/urls", (req, res) => {
  const newLongURL = req.body.longURL;
  const newShortURL = generateRandomString();
  const newUserID = req.session.userId;
  urlDatabase[newShortURL] = { longURL: newLongURL, userID: newUserID };
  res.redirect(`/urls/${newShortURL}`);
});
// WILL REDIRECT TO THE ACTUAL WEBSITE BY USING GET REQUEST /U/:SHORTURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
//AFTER POSTING/DELETE WILL DELETE KEY FROM THE DATABASE
app.post("/urls/:shortURL/delete", (req, res) =>{
  if (req.session.userId) {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/");
  }
});
//AFTER POST/UPDATING THE LONG URL
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.userId) {
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/");
  }
});
//AFTER POST LOGIN
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = fetchUserID(users, userEmail);
  if (!userEmail || !userPassword) {
    req.session.message = "Invalid Email/Password";
    res.redirect("/login");
  } else if (!userID) {
    res.statusCode = 403;
    req.session.message = "User Not Found";
    res.redirect("/login");
  } else if (!isPasswordCorrect(users,userID,userPassword)) {
    res.statusCode = 403;
    req.session.message = "Password is Incorrect";
    res.redirect("/login");
  } else {
    req.session.userId = userID;
    res.redirect("/urls");
  }
});
//AFTER LOGOUT
app.post("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/urls");
});
//REGISTER PAGE
app.get("/register", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    let templateVars = {users: users[req.session.userId], message: req.session.message};
    req.session.message = null;
    res.render("registration_form", templateVars);
  }
});
//POST /REGISTER USER INTO THE DATABASE
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    req.session.message = "Invalid Email/Password";
    res.redirect("/register");
  } else if (checkIfEmailIsInUserDatabase(users,req.body.email)) {
    res.statusCode = 400;
    req.session.message = "Email is already taken";
    res.redirect("/register");
  } else {
    let userID = generateRandomString();
    users[userID] = {id: '', email: '', password: ''};
    users[userID].email = req.body.email;
    users[userID].password = bcrypt.hashSync(req.body.password, 10);
    users[userID].id = userID;
    req.session.userId = userID;
    res.redirect("/urls");
  }
});
//LOGIN PAGE
app.get("/login", (req, res) => {
  let templateVars = {users: users[req.session.userId], message: req.session.message};
  req.session.message = null;
  res.render("login_form", templateVars);
});
//----------------------LISTEN------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});