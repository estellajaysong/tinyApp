const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').slice(4);
};
//cookie-parser
const cookieParser = require('cookie-parser')
app.use(cookieParser());
//

app.set("view engine", "ejs") // EJS as templating engine
app.use(bodyParser.urlencoded({extended: true}));

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

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.cookies["userID"];
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});
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
function emailCheck(email, password) {
  if (email === "" || password === "") {
    return "empty"
  };
  for (user in users) {
    if (users[user].email === email) {
      return "duplicate";
    };
  };
  return "ok"
};
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
      return "wrong password";``
    };
  };
  return "email not found";
};
function urlConvert() {
  if (longURL.slice(0, 4) === "www.") {
    longURL = "http://" + longURL;
  }
  else if (longURL.slice(0, 7) !== "http://" && longURL.slice(7, 11) !== "www.") {
    longURL = "http://www." + longURL;
  };
}
app.post("/register", (req, res) => {
  if (emailCheck(req.body.email, req.body.password) === "ok"){
    let newID = generateRandomString();
    users[newID] = {};
    users[newID].id = newID;
    users[newID].email = req.body.email;
    users[newID].password = bcrypt.hashSync(req.body.password, 10);
    res.cookie("userID", newID);
    res.redirect("/urls");
    console.log(users)
  } else {
    res.statusCode = 400;
  };
});
app.post("/urls/:shortURL/update", (req, res) => {
  if (req.cookies.userID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL]
    let newURL = req.body.newURL;
    urlDatabase[req.body.shortURL] = newURL;
  }
  res.redirect('/urls');
});
app.post("/login", (req, res) => {
  if ((loginCheck(req.body.email, req.body.password)) === user) {
    res.cookie("userID", user);
    res.redirect('/urls');    
  } else {
    res.statusCode = 403;
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie('userID')
  res.redirect('/urls')  
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/login", (req, res) => {
  res.render("login")
});
app.get("/urls", (req, res) => {
  if (!req.cookies["userID"]) {
  res.render("login_prompt")
  }
  else {
  let templateVars = { urls: urlsForUser(req.cookies["userID"]), userID: req.cookies["userID"], user: users[req.cookies.userID] };
  res.render("urls_index", templateVars)
  }
});
app.get("/urls/new", (req, res) => {
  let templateVars = { userID: req.cookies["userID"], user: users[req.cookies.userID] };
  if (req.cookies.userID){
    res.render("urls_new", templateVars)
    } else {
    res.redirect("/login")
    };  
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: req.cookies["userID"], user: users[req.cookies.userID] };
  if (!req.cookies.userID) {
    res.render("login_prompt")
  } else if (req.cookies.userID !== urlDatabase[req.params.shortURL].userID) {
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
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.userID] };
  res.render("register", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
app.get("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies.userID === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL]
  }
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
