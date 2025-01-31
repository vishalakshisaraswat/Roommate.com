const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes.js');
const roomRoutes = require('./routes/roomRoutes.js');
const bodyParser = require('body-parser');
const path = require('path'); 

const app = express();
const PORT = 3000;

// Connect to database
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'views')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/room', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'room.html'));
});

// Routes
app.use('/', userRoutes);
app.use('/profile', profileRoutes);
app.use('/room', roomRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
