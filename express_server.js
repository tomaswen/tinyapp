const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require('method-override')
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const {
  generateRandomString,
  checkIfEmailIsInUserDatabase,
  fetchUserID,
  isPasswordCorrect,
  getUserURL
} = require('./helper');

const PORT = 8080;
const app = express();
// const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(methodOverride('_method'));
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
    password: bcrypt.hashSync("12345", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("12345", 10)
  }
};

//----------------------REQUESTS-------------------------

//HOMEPAGE
app.get("/", (req, res) => {
  if (users[req.session.userId]) { //<--- IF THE USER COOKIE FROM PREVIOUS SESSION EXIST REDIRECT
    res.redirect("/urls");
  } else {     //<--- IF THE USER COOKIE FROM PREVIOUS SESSION DOES NOT EXIST, CLEAR THE COOKIE AND REDIRECT
    req.session.userId = null;
    res.redirect("/urls");
  }
  
});
//SENDS A HTML RESPONSE OF THE URLS IN THE DATABASE
app.get("/urls", (req,res) => {
  if (users[req.session.userId]) {
    const newUrlDatabase = getUserURL(urlDatabase, req.session.userId);
    let templateVars = { urls: newUrlDatabase , users: users[req.session.userId], message: req.session.message}; // MESSAGE IS THE ERROR MESSAGE PASSED ON AS A COOKIE LATER IN THE CODE
    req.session.message = null; //ERASE THE COOKIE
    res.render("urls_index", templateVars);
  } else if (req.session.message) { //IF THERE IS AN ERROR BUT NO USER IS LOGGED IN
    let templateVars = { urls: "" , users: "" , message: req.session.message};
    req.session.message = null;
    res.render("urls_index", templateVars);
  } else {
    let templateVars = { urls: "" , users: "" , message: ""};
    req.session.message = null;
    res.render("urls_index", templateVars);
  }
});
//SENDS HTML RESPONSE TO ADD NEW URL TO THE DATABASE
app.get("/urls/new", (req, res) => {
  if (users[req.session.userId]) {
    let templateVars = { users: users[req.session.userId]};
    res.render("urls_new",templateVars);
  } else {
    res.redirect("/");
  }
});
//SENDS HTML RESPONSE TO SHOW THE SPECIFIC SITE AND ITS SHORTENED URL
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] && req.session.userId === urlDatabase[req.params.shortURL].userID) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users: users[req.session.userId]};
    res.render("urls_show", templateVars);
  } else if (!urlDatabase[req.params.shortURL]) {
    req.session.message = "Short URL Does Not Exist"; // <--- FIRST EXAMPLE OF SETTING AN ERROR MESSAGE COOKIE
    res.redirect("/");
  } else if (urlDatabase[req.params.shortURL] && req.session.userId !== urlDatabase[req.params.shortURL].userID) {
    req.session.message = "Access Restricted";
    res.redirect("/");
  }
});
// AFTER POSTING/ADDING URL IT WILL REDIRECT BACK TO THE URL/:ID
app.put("/urls", (req, res) => {
  if (users[req.session.userId]) {
    const newLongURL = req.body.longURL;
    const newShortURL = generateRandomString();
    const newUserID = req.session.userId;
    urlDatabase[newShortURL] = { longURL: newLongURL, userID: newUserID };
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.redirect("/");
  }
});
// WILL REDIRECT TO THE ACTUAL WEBSITE BY USING GET REQUEST /U/:SHORTURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    req.session.message = "Short Link Does Not Exist";
    res.redirect('/urls');
  }
});
//WILL DELETE THE CORRESPONDING OBJECT FROM THE DATABASE
app.delete("/urls/:shortURL", (req, res) =>{
  if (users[req.session.userId]) {
    let shortURL = req.params.shortURL;
    if (urlDatabase[shortURL].userID !== req.session.userId) {
      req.session.message = "Action Forbidden";
      res.redirect("/");
    }
    delete urlDatabase[shortURL];
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});
//UPDATES THE LONG URL OF THE CORRESPONDING SHORT URL IN THE DATABASE
app.post("/urls/:shortURL", (req, res) => {
  if (users[req.session.userId]) {
    let shortURL = req.params.shortURL;
    if (urlDatabase[shortURL].userID !== req.session.userId) {
      req.session.message = "Access Restricted";
      res.redirect("/");
    }
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});
//AFTER POST LOGIN
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = fetchUserID(users, userEmail);
  if (!userEmail || !userPassword) { // <--- IF THERE ARE NO EMAIL OR PASSWORD ENTERED
    req.session.message = "Invalid Email/Password";
    res.redirect("/login");
  } else if (!userID) { //<---- IF USERID IS UNDEFINED
    req.session.message = "User Not Found";
    res.redirect("/login");
  } else if (!isPasswordCorrect(users,userID,userPassword)) {
    req.session.message = "Password is Incorrect";
    res.redirect("/login");
  } else {
    req.session.userId = userID;
    res.redirect("/");
  }
});
//LOGS OUT THE USER AND DELETES THE COOKIES
app.post("/logout", (req, res) => {
  req.session.userId = null;
  req.session.message = null;
  res.redirect("/");
});
//REGISTER PAGE
app.get("/register", (req, res) => {
  if (req.session.userId) {
    res.redirect("/");
  } else {
    let templateVars = {users: users[req.session.userId], message: req.session.message};
    req.session.message = null;
    res.render("registration_form", templateVars);
  }
});
//REGISTERS THE USER INTO THE DATABASE
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    req.session.message = "Invalid Email/Password";
    res.redirect("/register");
  } else if (checkIfEmailIsInUserDatabase(users,req.body.email)) {
    req.session.message = "Email Is Already Taken";
    res.redirect("/register");
  } else {
    let userID = generateRandomString();
    users[userID] = {id: '', email: '', password: ''};
    users[userID].email = req.body.email;
    users[userID].password = bcrypt.hashSync(req.body.password, 10);
    users[userID].id = userID;
    req.session.userId = userID;
    res.redirect("/");
  }
});
//LOGIN PAGE
app.get("/login", (req, res) => {
  if (users[req.session.userId]) {
    res.redirect("/");
  } else {
    let templateVars = {users: users[req.session.userId], message: req.session.message};
    req.session.message = null;
    res.render("login_form", templateVars);
  }
});
//----------------------LISTEN------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});