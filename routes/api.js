const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeObject } = require('../utils/sanitize');

const router = express.Router();

router.use(authenticateToken);

router.get('/data', async (req, res) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({ error: 'Request timeout' });
    }
  }, 5000);

  try {
    const itemsPath = path.join(__dirname, '../data/items.json');
    const itemsData = await fs.readFile(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);

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

router.delete('/data/:id', async (req, res) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(503).json({ error: 'Request timeout' });
    }
  }, 5000);

  try {
    const itemId = parseInt(req.params.id);

    if (isNaN(itemId)) {
      clearTimeout(timeout);
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const itemsPath = path.join(__dirname, '../data/items.json');
    const itemsData = await fs.readFile(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);

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
