const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3000;

const filePath = path.join(__dirname, 'users.txt');

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '');
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

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

app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
      res.send('Could not retrieve user data.');
      return;
    }

    const userEntries = data.split('\n\n');
    const userEntry = userEntries.find((entry) => entry.includes(`Email: ${identifier}`) || entry.includes(`Phone: ${identifier}`));

    if (userEntry) {
      const hashedPassword = userEntry.match(/Password: (.*)/)[1];
      const isMatch = await bcrypt.compare(password, hashedPassword);

      if (isMatch) {
        res.redirect('https://facebook.com');
      } else {
        res.send('Incorrect password.');
      }
    } else {
      res.send('User not found.');
    }
  });
});

app.get('/users', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.send('Could not retrieve user data.');
    } else {
      res.send(`<pre>${data}</pre>`);
    }
  });
});

app.get('/download-users', (req, res) => {
  res.download(filePath, 'users.txt', (err) => {
    if (err) {
      res.status(500).send('Error downloading the file.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
