// routes/api.js
import express from 'express';

const router = express.Router();

// ==========
// API routes
// ==========

// GET /api/cover
router.get('/cover', async (req, res) => {
  const { query } = req.query;
  try {
    const apiUrl = `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&token=${process.env.DISCOGS_TOKEN}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const result = {
      artist: data.results[0]?.title?.split(" - ")[0] || "Unknown Artist",
      album: data.results[0]?.title?.split(" - ")[1] || "Unknown Album",
      coverArtUrl: data.results[0]?.cover_image || null,
      success: true
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/proxy-image - Proxy images to bypass CORS
router.get('/proxy-image', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Use arrayBuffer() instead of buffer()
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Set appropriate headers
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.set('Access-Control-Allow-Origin', '*'); // Allow CORS
    
    res.send(buffer);
  } catch (err) {
    console.error('Proxy image error:', err);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});
export default router;
