const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(express.urlencoded({extended: true})); // changed to express bc body parser is deprecated

app.set('view engine', 'ejs');

function generateRandomString() {
  return Math.round(Math.pow(36, 5 + 1) - Math.random() * Math.pow(36, 5)).toString(36).slice(1);
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
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log('New urlDatabase: ', urlDatabase); // saved to urlDatabase and redirects to shortURL
  res.redirect(`urls/${shortURL}`); // respond with 'ok'
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

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