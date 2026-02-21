const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Public route – health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'HPK-Admin-Central API' });
});

// Protected routes – require a valid ZITADEL JWT
router.get('/systems', verifyToken, (_req, res) => {
  res.json({
    systems: [
      {
        id: 'warehouse',
        name: 'Warehouse System',
        url: process.env.WAREHOUSE_URL || '#',
      },
      {
        id: 'palliative',
        name: 'Palliative Care',
        url: process.env.PALLIATIVE_URL || '#',
      },
      {
        id: 'pharmacy',
        name: 'Pharmacy System',
        url: process.env.PHARMACY_URL || '#',
      },
      {
        id: 'admin',
        name: 'Admin Management',
        url: process.env.ADMIN_URL || '#',
      },
    ],
  });
});

router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
