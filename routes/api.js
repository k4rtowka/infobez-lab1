const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { sanitizeObject } = require('../utils/sanitize');

const router = express.Router();

router.use(authenticateToken);

router.get('/data', async (req, res) => {
  try {
    const itemsPath = path.join(__dirname, '../data/items.json');
    const itemsData = await fs.readFile(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);

    const sanitizedItems = sanitizeObject(items);

    res.json({
      message: 'Data retrieved successfully',
      data: sanitizedItems,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/data/:id', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);

    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const itemsPath = path.join(__dirname, '../data/items.json');
    const itemsData = await fs.readFile(itemsPath, 'utf8');
    const items = JSON.parse(itemsData);

    const itemIndex = items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const deletedItem = items[itemIndex];
    items.splice(itemIndex, 1);

    await fs.writeFile(itemsPath, JSON.stringify(items, null, 2), 'utf8');

    const sanitizedItem = sanitizeObject(deletedItem);

    res.json({
      message: 'Item deleted successfully',
      deletedItem: sanitizedItem,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
