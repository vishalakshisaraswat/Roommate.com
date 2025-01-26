const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const bodyParser = require('body-parser');
const path = require('path'); 

const app = express();
const PORT = 3000;

// Connect to database
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Routes
app.use('/', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
