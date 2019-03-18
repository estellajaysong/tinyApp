const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// generates user ID, as well as short URLs
function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').slice(4);
};
// creates an object of the URLs created by a specific user
function urlsForUser(id) {
  let userUrls = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = {};
      userUrls[url].shortURL = url;
      userUrls[url].longURL = urlDatabase[url].longURL;
    }
  }
  return userUrls;
}
// checks to see if the registration form submitted has empty fields, an existing account. or is acceptable
function emailCheck(email, password) {
  if (email === "" || password === "") {
    return "empty";
  };
  for (user in users) {
    if (users[user].email === email) {
      return "duplicate";
    };
  };
  return "ok";
};
// checks to see if the login form submitted has empty fields, does not exist, or is acceptable
function loginCheck(email, password) {
  if (email === "" || password === "") {
    return "empty";
  };
  for (user in users) {
    let hashedPassword = users[user].password
    if (users[user].email === email) {
      if (bcrypt.compareSync(password, hashedPassword) === true) {
        return user;
      }
      return "wrong password";
    };
  };
  return "email not found";
};
// converts the long URL submitted to proper format if the user did not include "https://"
function urlConvert(longURL) {
  if (longURL.slice(0, 4) === "www.") {
    longURL = "https://" + longURL;
  } else if (longURL.slice(0, 8) !== "https://" && longURL.slice(0, 7) !== "http://") {
    longURL = "https://" + longURL;
  };
  return longURL;
};
// creates a new short URL/long URL and adds it to the database
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = urlConvert(req.body.longURL);
  urlDatabase[shortURL].userID = req.session.userID;
  res.redirect(`/urls/${shortURL}`);         
});
// creates a new account
app.post("/register", (req, res) => {
  if (emailCheck(req.body.email, req.body.password) === "ok") {
    let newID = generateRandomString();
    users[newID] = {};
    users[newID].id = newID;
    users[newID].email = req.body.email;
    users[newID].password = bcrypt.hashSync(req.body.password, 10);
    req.session.userID = newID;
    res.redirect("/urls");
  } else if (emailCheck(req.body.email, req.body.password) === "empty") {
    res.render("empty");
    res.statusCode = 400;
  } else if (emailCheck(req.body.email, req.body.password) === "duplicate") {
    res.render("duplicate");
    res.statusCode = 400;
  }
});
// updates a short URL with a new long URL
app.post("/urls/:shortURL/update", (req, res) => {
  if (req.session.userID === urlDatabase[req.params.shortURL].userID) {
    let newURL = urlConvert(req.body.newURL);
    urlDatabase[req.body.shortURL].longURL = newURL;
  }
  res.redirect('/urls');
});
// sees if the user has the right credential to log in
app.post("/login", (req, res) => {
  if ((loginCheck(req.body.email, req.body.password)) === user) {
    req.session.userID = user;
    res.redirect('/urls');
  } else {
    res.render("wrongID");
    res.statusCode = 403;
  }
});
// clears cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/urls", (req, res) => {
  if (!req.session.userID) {
    res.render("login_prompt");
  }
  else {
    let templateVars = { urls: urlsForUser(req.session.userID), userID: req.session.userID, user: users[req.session.userID] };
    res.render("urls_index", templateVars);
  }
});
// the user is allowed to create a new URL only if they are logged in. otherwise, they are redirected to the 
// login page
app.get("/urls/new", (req, res) => {
  let templateVars = { userID: req.session.userID, user: users[req.session.userID] };
  if (req.session.isNew === false) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  };
});
// if the user is not signed in, they are prompted to log in. if the user did not create that URL, they are 
// barred access. otherwise, they are allowed access to modify that URL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: req.session.userID, user: users[req.session.userID] };
  if (!req.session.userID) {
    res.render("login_prompt");
  } else if (req.session.userID !== urlDatabase[req.params.shortURL].userID) {
    res.render("wrong_url", templateVars);
  } else {
    res.render("urls_show", templateVars);
  };
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/register", (req, res) => {
  if (!req.session.userID) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.session.userID] };
    res.render("register", templateVars);
  } else {
    res.redirect("/urls");
  }
});
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.render("not_found");
  }
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.userID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL]
  } else {
    res.render("permission");
  }
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
