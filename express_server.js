const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
function generateRandomString() {
  return Math.random().toString(36).replace('0.', '').slice(4)
}
app.set("view engine", "ejs") // EJS as templating engine
app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
  });
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  });  
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
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



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});