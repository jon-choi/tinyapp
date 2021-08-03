const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

function generateRandomString() {
  return Math.round(Math.pow(36, 5 + 1) - Math.random() * Math.pow(36, 5))
  .toString(36)
  .slice(1);
}


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  'ud6ds': 'http://www.soundcloud.com'
};

app.get('/', (req, res) => {
  res.send('Hello!')
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body);  // log the POST request body to the console
  urlDatabase[generateRandomString()] = req.body.longURL;
  console.log('New urlDatabase: ', urlDatabase);
  res.send('Ok'); // respond with 'ok'
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// app.get('urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});