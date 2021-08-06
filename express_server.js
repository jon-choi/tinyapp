///--------> SETTINGS <--------///
const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcrypt");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const helpers = require("./helpers");

///--------> HELPER FUNCTION <--------///
function generateRandomString() {
  return Math.round(Math.pow(36, 5 + 1) - Math.random() * Math.pow(36, 5))
    .toString(36)
    .slice(1);
}

///--------> MIDDLEWARE <--------///
app.use(express.urlencoded({ extended: true })); // changed to express bc body parser is deprecated
app.use(
  cookieSession({
    name: "session",
    secret: "so-dry",
  })
);
app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.use(morgan("dev"));

///--------> DATA <--------///
const urlDatabase = {
  ymlkw: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "ghbi8j",
  },
};

const users = {
  ymlkw: {
    id: "ymlkw",
    email: "user@example.com",
    password: "hashed",
  },
  i3BoGr: {
    id: "i3BoGr",
    email: "user2@example.com",
    password: "hashed",
  },
};

///--------> SERVER DATABASES <--------///
// const urlDatabase = {};

// const users = {};

///--------> GET REQUESTS <--------///

// registers handler in root path
app.get("/", (req, res) => {
  res.send("Hello!");
});

// redirects from short url to long url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    res.send("We can't find the URL you're searching for.");
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
  const userObj = users[userID];

  if (!userID) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: userObj,
    };
    res.render("urls_new", templateVars);
  }
});

// route to urls page
app.get("/urls", (req, res) => {
  const userObj = users[req.session.user_id];
  const templateVars = {
    urls: urlDatabase,
    user: userObj,
  };
  res.render("urls_index", templateVars);
});

// registration route handler
app.get("/register", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: null,
    };
    res.render("urls_register", templateVars);
  }
});

// route to login page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: null,
    };
    res.render("urls_login", templateVars);
  }
});

// route to edit page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];

  if (shortURL.userID !== req.session.user_id) {
    res.send("Permission denied.");
  }
  const userObj = users[req.session.user_id];
  let templateVars = {
    user: userObj,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

///--------> POST REQUESTS <--------///
// registering a new user
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userPwd = req.body.password;
  const hashed = bcrypt.hashSync(userPwd, 10);

  if (!req.body.email || !userPwd) {
    res
      .status(400)
      .send("Error 400: Please enter a valid email and/or password");
  } else if (helpers.isEmail(req.body.email, users)) {
    res.status(400).send("Error 400: This email is already registered.");
    return res.redirect("/register");
  } else {
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: hashed,
    };
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

// login endpoint
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPwd = req.body.password;
  const user = helpers.getUserByEmail(userEmail, users);

  if (!user) {
    res
      .status(403)
      .send(
        "Error 403: Sorry, the email and/or password you entered is invalid. Please try again."
      );
  }
  if (user) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res
      .status(403)
      .send(
        "Error 403: Sorry, the email and/or password you entered is invalid. Please try again."
      );
  }
});

// log out endpoint
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// route to redirect to urls page
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    if (!req.body.longURL) {
      res.redirect("/urls/new");
    }
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    const userId = req.session.user_id;

    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userId,
    };
    res.redirect("/urls");
  } else {
    res.status(403).redirect("/login");
  }
});

// allows user to delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    let shortURL = req.params.shortURL;

    if (urlDatabase[shortURL].userID === req.session.user_id) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    } else {
      res.send("Sorry. That's not allowed.");
    }
  } else {
    res.send("You must be logged in to delete this.");
  }
});

// updates url resource
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;

    if (urlDatabase[shortURL].userID === req.session.user_id) {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect("/urls");
    } else {
      res.send("You are not allowed here!");
    }
  } else {
    res.redirect("/login");
  }
});

///--------> PORT LISTENER <--------///
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
