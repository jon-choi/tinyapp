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

function getEmail(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return null;
}

module.exports = {
  isEmail,
  generateRandomString,
  getEmail
};

