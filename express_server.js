const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').slice(4)
}
//cookie-parser
const cookieParser = require('cookie-parser')
app.use(cookieParser())
//

app.set("view engine", "ejs") // EJS as templating engine
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
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
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});
app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
    res.render("urls_index", templateVars);
  });
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
    res.render("urls_new", templateVars);
  });
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
  });  
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  });
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/register", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("register", templateVars);
});
function emailCheck(email, password) {
  if (email === "" || password === "") {
    return "empty"
  }
  for (user in users) {
    if (users[user].email === email) {
      return "duplicate"
    }
  }
  return "ok"
}
app.post("/register", (req, res) => {
  // emailCheck(req.body.email)
  if (emailCheck(req.body.email, req.body.password) === "ok"){
    let newID = generateRandomString();
    users[newID] = {};
    users[newID].id = newID;
    users[newID].email = req.body.email;
    users[newID].password = req.body.password;
    res.cookie("userID", newID);
    res.redirect("/urls");
  } else {
    res.statusCode = 400;
    console.log(res.statusCode)
  };
  
});
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  let templateVars = { username: req.cookies["username"] };
  if (longURL.slice(0, 4) === "www.") {
    longURL = "http://" + longURL;
  }
  else if (longURL.slice(0, 7) !== "http://" && longURL.slice(7, 11) !== "www.") {
    longURL = "http://www." + longURL;
  }
  res.redirect(longURL);
});
app.get("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL] 
  res.redirect('/urls');     
});
app.post("/urls/:shortURL/update", (req, res) => {
  let newURL = req.body.newURL
  urlDatabase[req.body.shortURL] = newURL
  res.redirect('/urls')  
});
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls')  
});
app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')  
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});