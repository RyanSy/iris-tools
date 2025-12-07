// routes/api.js
import express from 'express';

const router = express.Router();

// ==========
// API routes
// ==========

// GET /api/test
router.get('/test', (req, res, next) => {
  res.send('respond with a resource');
});

export default router;
