const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeObject } = require('../utils/sanitize');

const router = express.Router();

const fileOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many file operations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authenticateToken);

router.get('/data', fileOperationLimiter, async (req, res) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({ error: 'Request timeout' });
    }
  }, 5000);

  try {
    const itemsPath = path.join(__dirname, '../data/items.json');
    
    const stats = await fs.stat(itemsPath);
    if (stats.size > 10 * 1024 * 1024) {
      clearTimeout(timeout);
      return res.status(413).json({ error: 'File size exceeds limit' });
    }
    
    const itemsData = await fs.readFile(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);

    if (!Array.isArray(items)) {
      clearTimeout(timeout);
      return res.status(500).json({ error: 'Invalid data format' });
    }

    if (items.length > 1000) {
      clearTimeout(timeout);
      return res.status(413).json({ error: 'Data size exceeds limit' });
    }

    const sanitizedItems = sanitizeObject(items);

    clearTimeout(timeout);
    res.json({
      message: 'Data retrieved successfully',
      data: sanitizedItems,
    });
  } catch (error) {
    clearTimeout(timeout);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/data/:id', fileOperationLimiter, async (req, res) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({ error: 'Request timeout' });
    }
  }, 5000);

  try {
    if (!req.params || typeof req.params.id === 'undefined') {
      clearTimeout(timeout);
      return res.status(400).json({ error: 'ID parameter is required' });
    }

    const itemId = parseInt(req.params.id, 10);

    if (isNaN(itemId) || !Number.isInteger(itemId) || itemId < 0) {
      clearTimeout(timeout);
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const itemsPath = path.join(__dirname, '../data/items.json');
    
    const stats = await fs.stat(itemsPath);
    if (stats.size > 10 * 1024 * 1024) {
      clearTimeout(timeout);
      return res.status(413).json({ error: 'File size exceeds limit' });
    }
    
    const itemsData = await fs.readFile(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);

    if (!Array.isArray(items)) {
      clearTimeout(timeout);
      return res.status(500).json({ error: 'Invalid data format' });
    }

    if (items.length > 1000) {
      clearTimeout(timeout);
      return res.status(413).json({ error: 'Data size exceeds limit' });
    }

    const itemIndex = items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      clearTimeout(timeout);
      return res.status(404).json({ error: 'Item not found' });
    }

    const deletedItem = items[itemIndex];
    items.splice(itemIndex, 1);

    await fs.writeFile(itemsPath, JSON.stringify(items, null, 2), 'utf8');

    const sanitizedItem = sanitizeObject(deletedItem);

    clearTimeout(timeout);
    res.json({
      message: 'Item deleted successfully',
      deletedItem: sanitizedItem,
    });
  } catch (error) {
    clearTimeout(timeout);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
