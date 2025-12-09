import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import cors from 'cors';

import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.AUTH0_BASE_URL 
    : 'http://localhost:5173',
  credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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

// Protect API routes with JWT validation
app.use('/api', checkJwt, apiRouter);

// Serve static frontend files (unprotected)
app.use(express.static(path.resolve(__dirname, 'frontend', 'dist')));

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
});

// Error handling for JWT validation
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next(err);
});

export default app;