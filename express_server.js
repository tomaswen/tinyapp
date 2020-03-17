const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

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
//----------------------URL-DATABASE---------------------

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//----------------------REQUESTS-------------------------

//HOMEPAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});
//SEND A JSON OF URLS IN THE HARDCODED DATABASE
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//PRINTS HELLO WORLD
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//SENDS A HTML RESPONSE OF THE URLS IN THE DATABASE
app.get("/urls", (req,res) => {
  let templateVars = { urls: urlDatabase , username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});
//SENDS HTML RESPONSE TO ADD NEW URL TO THE DATABASE
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"]};
  res.render("urls_new",templateVars);
});
//SENDS HTML RESPONSE TO SHOW THE SPECIFIC SITE AND ITS SHORTENED URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
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
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
//AFTER LOGOUT
app.post("/logout", (req, res) =>{
  res.clearCookie("username");
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});