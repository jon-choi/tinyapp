function isEmail(newEmail, users) {
  for (const user in users) {
    if (users[user].email === newEmail) {
      return true;
    } else {
      return false;
    }
  }
}

function generateRandomString() {
  return Math.round(Math.pow(36, 5 + 1) - Math.random() * Math.pow(36, 5)).toString(36).slice(1);
}

function getUserByEmail(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
}

function urlsForUser(user) {
  const urls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === user.id) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
}

module.exports = {
  isEmail,
  generateRandomString,
  getUserByEmail,
  urlsForUser
};

