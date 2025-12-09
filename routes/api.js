// routes/api.js
import express from 'express';
import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

const router = express.Router();

// JWT validation middleware
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `${process.env.AUTH0_ISSUER_BASE_URL}/`,
  algorithms: ['RS256']
});

// ==========
// PUBLIC ROUTES (no JWT required)
// ==========

// GET /api/proxy-image - Proxy images to bypass CORS (PUBLIC)
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

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Set appropriate headers
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
      ? process.env.AUTH0_BASE_URL 
      : 'http://localhost:5173'
    );
    
    res.send(buffer);
  } catch (err) {
    console.error('Proxy image error:', err);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// ==========
// PROTECTED ROUTES (JWT required)
// ==========

// Apply JWT protection to remaining routes
router.use(checkJwt);

// GET /api/cover - Now returns multiple images
router.get('/cover', async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const apiUrl = `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&token=${process.env.DISCOGS_TOKEN}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Discogs API error: ${response.statusText}`);
    }
    
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: 'No results found' });
    }

    const firstResult = data.results[0];
    let images = [];
    
    // Try to get detailed images from resource_url
    if (firstResult.resource_url) {
      try {
        const releaseResponse = await fetch(firstResult.resource_url);
        
        if (releaseResponse.ok) {
          const release = await releaseResponse.json();
          const releaseImages = release.images || [];
          
          if (releaseImages.length > 0) {
            images = releaseImages.map(img => img.uri).filter(Boolean);
          }
        }
      } catch (detailErr) {
        console.warn('Failed to fetch detailed images, falling back to cover_image:', detailErr);
      }
    }
    
    // Fallback: use cover_image from search results if no detailed images
    if (images.length === 0 && firstResult.cover_image) {
      images = [firstResult.cover_image];
    }
    
    // Final check
    if (images.length === 0) {
      return res.status(404).json({ error: 'No images found for this release' });
    }

    const result = {
      artist: firstResult?.title?.split(" - ")[0] || "Unknown Artist",
      album: firstResult?.title?.split(" - ")[1] || "Unknown Album",
      images: images,
      coverArtUrl: images[0], // Keep for backwards compatibility
      success: true
    };

    res.json(result);
  } catch (err) {
    console.error('Cover API error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch cover art' });
  }
});


// GET /api/labels
router.get('/labels', async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const apiUrl = `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&format=vinyl&token=${process.env.DISCOGS_TOKEN}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Discogs API error: ${response.statusText}`);
    }
    
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: 'No results found' });
    }

    const resourceUrl = data.results[0].resource_url;
    const releaseResponse = await fetch(resourceUrl);
    
    if (!releaseResponse.ok) {
      throw new Error(`Failed to fetch release details: ${releaseResponse.statusText}`);
    }
    
    const release = await releaseResponse.json();
    const releaseImages = release.images || [];
    
    const imgArray = releaseImages.map(img => img.uri).filter(Boolean);
    
    if (imgArray.length === 0) {
      return res.status(404).json({ error: 'No label images found for this release' });
    }
    
    const result = {
      artist: data.results[0]?.title?.split(" - ")[0] || "Unknown Artist",
      album: data.results[0]?.title?.split(" - ")[1] || "Unknown Album",
      images: imgArray,
      success: true
    };

    res.json(result);
  } catch (err) {
    console.error('Labels API error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch label images' });
  }
});

// Error handling middleware for JWT validation
router.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Invalid or missing token',
      message: err.message 
    });
  }
  next(err);
});

export default router;
