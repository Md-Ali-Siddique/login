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

app.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userData = `Name: ${firstName} ${lastName}\nEmail: ${email}\nPassword: ${hashedPassword}\nPhone: ${phone}\n\n`;

  fs.appendFile(filePath, userData, (err) => {
    if (err) {
      console.error('Error saving data:', err);
      res.send('An error occurred while saving your data.');
    } else {
      console.log('Data saved successfully!');
      res.redirect('/thank-you');
    }
  });
});

app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      res.send('An error occurred while logging in.');
      return;
    }

    const users = data.split('\n\n');
    const userExists = users.some(user => {
      const emailMatch = user.includes(`Email: ${identifier}`);
      const phoneMatch = user.includes(`Phone: ${identifier}`);
      const passwordMatch = user.includes(`Password: ${password}`);
      return (emailMatch || phoneMatch) && passwordMatch;
    });

    if (userExists) {
      res.redirect('/welcome');
    } else {
      res.send('Invalid login credentials.');
    }
  });
});

app.get('/users', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading user data:', err);
      res.send('Could not retrieve user data.');
      return;
    }
    res.send(`<pre>${data}</pre>`);
  });
});

app.get('/download-users', (req, res) => {
  res.download(filePath, 'users.txt', (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).send('Error downloading the file.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
