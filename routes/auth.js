const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const { comparePassword } = require('../utils/hash');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({ error: 'Request timeout' });
    }
  }, 5000);

  try {
    if (!req.body || typeof req.body !== 'object') {
      clearTimeout(timeout);
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      clearTimeout(timeout);
      return res
        .status(400)
        .json({ error: 'Username and password are required' });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      clearTimeout(timeout);
      return res.status(400).json({ error: 'Username and password must be strings' });
    }

    if (username.length > 100 || password.length > 100) {
      clearTimeout(timeout);
      return res.status(400).json({ error: 'Input size exceeds limit' });
    }

    const usersPath = path.join(__dirname, '../data/users.json');
    const usersData = await fs.readFile(usersPath, 'utf8');
    const users = JSON.parse(usersData);

    const user = users.find((u) => u.username === username);
    if (!user) {
      clearTimeout(timeout);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      clearTimeout(timeout);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    clearTimeout(timeout);
    res.json({
      message: 'Login successful',
      token: token,
    });
  } catch (error) {
    clearTimeout(timeout);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
