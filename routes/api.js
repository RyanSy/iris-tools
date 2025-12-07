const express = require('express');
const router = express.Router();

// ==========
// API routes
// ==========

// GET /api/test
router.get('/test', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
