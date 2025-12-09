import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { auth } from 'express-openid-connect';

import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.AUTH0_BASE_URL 
    : 'http://localhost:5173',
  credentials: true
}));

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
};

app.use(auth(config)); // attaches /login, /logout, /callback

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// All routes are now protected automatically
app.use('/api', (req, res, next) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}, apiRouter);

app.use(express.static(path.resolve(__dirname, 'frontend', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
});

export default app;
