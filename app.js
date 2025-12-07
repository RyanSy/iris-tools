// app.js
import cookieParser from 'cookie-parser';
import express from 'express';
import logger from 'morgan';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite'; // adjust import if needed

import apiRouter from './routes/api.js'; // note the .js extension in ESM

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    root: path.resolve(__dirname, 'frontend'), // point to frontend folder
    appType: 'custom',
  });
  app.use(vite.middlewares);
} else {
  // In production, serve built assets
  app.use(express.static(path.resolve(__dirname, 'frontend', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
}

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRouter);

export default app;
