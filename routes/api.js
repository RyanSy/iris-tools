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

// POST /api/shopify/create-product - Create product in Shopify
router.post('/shopify/create-product', async (req, res) => {
  const {
    title,
    description,
    price,
    compareAtPrice,
    sku,
    inventory,
    productType,
    vendor,
    tags,
    published,
    imageBlob,
  } = req.body;

  if (!title || !price) {
    return res.status(400).json({ error: 'Title and price are required' });
  }

  try {
    const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01';

    if (!shopifyDomain || !accessToken) {
      throw new Error('Shopify credentials not configured');
    }

    // Prepare product payload
    const productPayload = {
      product: {
        title: title,
        body_html: description || '',
        vendor: vendor || 'IRIS Tools',
        product_type: productType || 'Frame',
        tags: tags || '',
        status: published ? 'active' : 'draft',
        variants: [
          {
            price: parseFloat(price),
            compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
            sku: sku || '',
            inventory_management: inventory ? 'shopify' : null,
            inventory_quantity: inventory ? parseInt(inventory) : 0,
          },
        ],
      },
    };

    // Create product in Shopify
    const createProductUrl = `https://${shopifyDomain}/admin/api/${apiVersion}/products.json`;
    const createResponse = await fetch(createProductUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify(productPayload),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Shopify API error: ${JSON.stringify(errorData)}`);
    }

    const productData = await createResponse.json();
    const productId = productData.product.id;

    // If we have an image blob, upload it
    if (imageBlob) {
      // Convert base64 blob to buffer if needed
      let imageBuffer;
      if (imageBlob.startsWith('data:image')) {
        // It's a data URL
        const base64Data = imageBlob.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        imageBuffer = Buffer.from(imageBlob, 'base64');
      }

      // Upload image to Shopify
      const imagePayload = {
        image: {
          attachment: imageBuffer.toString('base64'),
          filename: `${title.replace(/[^a-z0-9]/gi, '_')}.jpg`,
        },
      };

      const uploadImageUrl = `https://${shopifyDomain}/admin/api/${apiVersion}/products/${productId}/images.json`;
      await fetch(uploadImageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify(imagePayload),
      });
    }

    res.json({
      success: true,
      productId: productId,
      productUrl: `https://${shopifyDomain}/admin/products/${productId}`,
    });
  } catch (err) {
    console.error('Shopify create product error:', err);
    res.status(500).json({ error: err.message || 'Failed to create Shopify product' });
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
