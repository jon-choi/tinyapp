const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

app.use(express.urlencoded({extended: true})); // changed to express bc body parser is deprecated
app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(morgan('dev'));

function generateRandomString() {
  return Math.round(Math.pow(36, 5 + 1) - Math.random() * Math.pow(36, 5)).toString(36).slice(1);
}

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  'ud6ds': 'http://www.soundcloud.com',
  'hetc4': 'http://www.basscoast.ca'
};

app.get('/', (req, res) => {
  res.send('Hello!')
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  }
  res.render('urls_new', templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// login endpoint
app.post('/login', (req, res) => {
  const loginUsername = req.body.username;
  res.cookie('username', loginUsername);
  res.redirect('/urls');
});

// log out endpoint
app.post('/logout', (req, res) => {
  const loginUsername = req.body.username;
  res.clearCookie('username', loginUsername);
  res.redirect('/urls')
});

app.post('/urls', (req, res) => {
  console.log(req.body);  // log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log('New urlDatabase: ', urlDatabase); // saved to urlDatabase and redirects to shortURL
  res.redirect(`urls/${shortURL}`); // respond with 'ok'
});

// allows user to delete url
app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

// updates url resource
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls');
})

// redirects from short url to long url 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('Error. Page not found.');
  }
  res.redirect(longURL);
});

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