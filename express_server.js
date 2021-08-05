
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helperFunction = require('./helperFunction');

app.use(express.urlencoded({extended: true})); // changed to express bc body parser is deprecated
app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(morgan('dev'));

function generateRandomString() {
  return Math.round(Math.pow(36, 5 + 1) - Math.random() * Math.pow(36, 5)).toString(36).slice(1);
}

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  ixikp: {
    longURL: "https://www.basscoast.ca",
    userID: "aJ98lE"
  }
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
  },
  "user3RandomID": {
    id: "DeltonID",
    email: "delton@gmail.com",
    password: "ginger"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  const userObj = users[userID];

  if (!userID) {
    res.redirect('/login');
  }else {
    let templateVars = {
      user: userObj
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const userObj = users[req.cookies.user_id];
  const templateVars = {
    urls: urlDatabase,
    user: userObj
  };
  res.render("urls_index", templateVars);
});

// registration route handler
app.get('/register', (req, res) => {
  const userObj = users[req.cookies.user_id];
  const templateVars = {
    urls: urlDatabase,
    user: userObj
  };
  res.render('urls_register', templateVars);
});

// registering a new user
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPwd = req.body.password;

  if (!userEmail || !userPwd) {
    res.status(400).send("Error 400: Please enter a valid email and/or password");
  } else if (helperFunction.isEmail(userEmail, users)) {
    res.status(400).send("Error 400: This email is already registered.");
    return res.redirect('/register');
  } else {
    users[userID] = {
      id: userID,
      email: userEmail,
      password: userPwd,
    };
    res.cookie("user_id", userID);
  res.redirect("/urls");
  }
});

app.get('/login', (req, res) => {
  const userObj = users[req.cookies.user_id];
  const templateVars = {
    urls: urlDatabase,
    user: userObj
  }
  res.render('urls_login', templateVars);
});

// login endpoint
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPwd = req.body.password;
  const userID = helperFunction.getEmail(userEmail, users);

  if(!userID) {
    res.status(403).send('Error 403: Sorry, the email you entered is invalid. Please try again.');
  } else if (userPwd !== users[userID].password) {
    res.status(403).send('Error 403: Sorry, the password you entered is invalid. Please try again.')
  }
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

// log out endpoint
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  if (req.cookies.user_id) {
    if (!req.body.longURL) {
      res.redirect('/urls/new');
    }
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    const userId = req.cookies.user_id;

    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userId
    };
    res.redirect('/urls');
  } else {
    res.status(403).redirect('/login');
  }
});

// allows user to delete url
app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  const creator = urlDatabase[shortURL].userID;
  const user = req.cookies.user_id;

  if (user === creator) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send("You're not allowed here. Get out!");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userObj = users[req.cookies.user_id]
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    urls: urlDatabase,
    user: userObj
  };
  res.render("urls_show", templateVars);
});

// updates url resource
app.post('/urls/:shortURL', (req, res) => {
  if (req.cookies.user_id) {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;

    if (urlDatabase[shortURL].userID === req.cookies.user_id) {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect('/urls');
    } else {
      res.send("You are not allowed here!");
    }
  } else {
    res.redirect('/login');
  }
});

// redirects from short url to long url 
app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];

  if (!urlDatabase[req.params.shortURL]) {
    res.send("URL does not exist.");
  }
  res.redirect(url.longURL)
});

// TODO if the user is logged in but does not own the URL with the given id, return HTML with relevant message
// TODO rework url function

// urlDatabase as a JSON file
// app.get('urls.json', (req, res) => {
//   res.json(urlDatabase);
// });


// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});