const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
   let randomStr = '';
   let charString = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
   for (let i = 0; i <= 5; i++){
      let randomIndex = Math.floor(Math.random()*61);
      randomStr += charString.charAt(randomIndex);
   }
   return randomStr;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
   res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
   res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req,res) => {
   let templateVars = { urls: urlDatabase}
   res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
   res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
   let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}
   res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) => {
   let newLongURL = req.body.longURL;
   let newShortURL = generateRandomString();
   urlDatabase[newShortURL] = newLongURL
   console.log(urlDatabase)
   res.redirect(`/urls/${newShortURL}`);        
});

app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL]
   console.log(longURL)
   res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});