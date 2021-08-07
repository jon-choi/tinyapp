///--------> SETTINGS <--------///
const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcrypt");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const { generateRandomString, isEmailExist, getUserByEmail, urlsForUser, cookieHasUser } = require('./helpers');
const e = require("express");

///--------> HELPER FUNCTION <--------///


///--------> MIDDLEWARE <--------///
app.use(express.urlencoded({ extended: true })); // changed to express bc body parser is deprecated
app.use(
  cookieSession({
    name: "session",
    secret: "so-dry",
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.use(morgan("dev"));

///--------> SERVER DATABASES <--------///
const urlDatabase = {};

const users = {};

///--------> GET REQUESTS <--------///

// registers handler in root path
app.get("/", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// redirects from short url to long url
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL you're trying to access does not exist, apparently.");
  }
});

// urlDatabase as a JSON file
app.get("urls.json", (req, res) => {
  res.json(urlDatabase);
});

// simple HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// route to new url form
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;

  if (!cookieHasUser(userID, users)) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[userID],
    };
    res.render("urls_new", templateVars);
  }
});

// route to urls page
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  }
  res.render('urls_index', templateVars)
});

// registration route handler
app.get("/register", (req, res) => {
  const userID = req.session.user_id;

  if (cookieHasUser(userID, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[userID],
    };
    res.render("urls_register", templateVars);
  }
});

// route to login page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;

  if (cookieHasUser(userID, users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[userID]
    };
    res.render("urls_login", templateVars);
  }
});

// route to edit page
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUser: urlDatabase[req.params.shortURL].userID,
      user: users[req.session.user_id],
    };
    res.render('urls_show', templateVars);
  } else {
    res.send("This short URL does not exist.")
  }
});

///--------> POST REQUESTS <--------///
// registering a new user
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.send("Please enter valid email or password.");
  } else if (isEmailExist(email, users)) {
    res.send("This email is already registered");
  } else {
    const newUser = generateRandomString();
    users[newUser] = {
      id: newUser,
      email: email,
      password: bcrypt.hashSync(password, 10),
    }
    req.session.user_id = newUser;
    res.redirect('/urls');
  }
});

// login endpoint
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!isEmailExist(email, users)) {
    res.send("Invalid email");
  } else {
    const userID = getUserByEmail(email, users);
    if (!bcrypt.compareSync(password, userID.password)) {
      res.send("Invalid password")
    } else {
      req.session.user_id = userID.id;
      res.redirect('/urls');
    }
  }
});

// log out endpoint
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// route to redirect to urls page
app.post("/urls/", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send("Please log in to create URLS.")
  }
});

// allows user to delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userURL = urlsForUser(userID, urlDatabase);
  if (Object.keys(userURL).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send("You're not allowed to delete this URL.");
  }
});

// updates url resource
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    const longURL = req.body.longURL;
    const shortURL = req.params.shortURL;

    if (urlDatabase[shortURL].userID === req.session.user_id) {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect('/urls');
    } else {
      res.send("You don't own this URL. Get out.");
    }
  } else {
    res.redirect('/login');
  }
});

///--------> PORT LISTENER <--------///
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
