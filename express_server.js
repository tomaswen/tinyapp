const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

//----------------------URL-DATABASE---------------------

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//----------------------USER-DATABASE---------------------

const users = {
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
// FETCH USER_ID FROM DATABASE USING EMAIL
const fetchUserID = (database, email) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
};
//CHECKS IF PASSWORD MATCHES TO THE ONE IN DATABASE GIVEN AN ID
const isPasswordCorrect = (database, id, password) => {
  if (database[id].password === password) {
    return true;
  }
  return false;
};
//----------------------REQUESTS-------------------------

//HOMEPAGE
app.get("/", (req, res) => {
  res.redirect("/urls");
});
// //SEND A JSON OF URLS IN THE HARDCODED DATABASE
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
// //PRINTS HELLO WORLD
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
//SENDS A HTML RESPONSE OF THE URLS IN THE DATABASE
app.get("/urls", (req,res) => {
  let templateVars = { urls: urlDatabase , users: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});
//SENDS HTML RESPONSE TO ADD NEW URL TO THE DATABASE
app.get("/urls/new", (req, res) => {
  if(req.cookies["user_id"]){
    let templateVars = { users: users[req.cookies["user_id"]]};
    res.render("urls_new",templateVars);
  } else {
    res.redirect("/login")
  }
});
//SENDS HTML RESPONSE TO SHOW THE SPECIFIC SITE AND ITS SHORTENED URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], users: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});
// AFTER POSTING/ADDING URL IT WILL REDIRECT BACK TO THE URL/:ID
app.post("/urls", (req, res) => {
  let newLongURL = req.body.longURL;
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = newLongURL;
  res.redirect(`/urls/${newShortURL}`);
});
// WILL REDIRECT TO THE ACTUAL WEBSITE BY USING GET REQUEST /U/:SHORTURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
//AFTER POSTING/DELETE WILL DELETE KEY FROM THE DATABASE
app.post("/urls/:shortURL/delete", (req, res) =>{
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
//AFTER POST/UPDATING THE LONG URL
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});
//AFTER POST LOGIN
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = fetchUserID(users, userEmail);
  if (!userID) {
    res.send("not found");// <------------------------- IMPROVE
  } else if (!isPasswordCorrect(users,userID,userPassword)) {
    res.send("Password incorrect");// <------------------------- IMPROVE
  } else {
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});
//AFTER LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
//REGISTER PAGE
app.get("/register", (req, res) => {
  let templateVars = { users: users[req.cookies["user_id"]]};
  res.render("registration_form", templateVars);
});
//POST /REGISTER USER INTO THE DATABASE
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400; 
    res.send("invalid email/password");// <------------------------- IMPROVE
  }
  if (checkIfEmailIsInUserDatabase(users,req.body.email)) {
    res.statusCode = 400;
    res.send("Email is already taken");// <------------------------- IMPROVE
  } else {
    let userID = generateRandomString();
    users[userID] = req.body;
    users[userID].id = userID;
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});
//LOGIN PAGE
app.get("/login", (req, res) => {
  let templateVars = {users: users[req.cookies["user_id"]]};
  res.render("login_form", templateVars);
});

//----------------------LISTEN------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});