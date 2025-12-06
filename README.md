# Album Cover & Vinyl Label Finder

A Cloudflare Pages app with Functions backend and React frontend that searches for LP cover art and center labels via Discogs API.

## 🚀 Features
- **Cover Search**: Enter album title or catalog number → fetch cover art.
- **Label Search**: Enter artist, title, or catalog number → fetch vinyl center labels.
- **Frontend**: React app with two routes (`/` for covers, `/labels` for labels).
- **Backend**: Cloudflare Pages Functions handle API calls.



## 🔑 Environment Variables

Set these in **Cloudflare Pages → Project Settings → Environment Variables**:

- `DISCOGS_TOKEN` → Personal access token from Discogs API
- `APP_URL` → Your Cloudflare Pages domain (e.g. `https://yourapp.pages.dev`)

## 🛠️ Setup

### Local Development
```bash
# Root dependencies (backend)
npm install jose

# Frontend dependencies
cd frontend
npm install react react-dom react-router-dom react-scripts

# Run frontend locally
npm start
```



## 🌐 Deployment to Cloudflare Pages

1. Push project to GitHub.

2. In Cloudflare dashboard → Pages → Create new project → Connect repo.

3. Build settings:

    - Framework preset: React

    - Build command: npm run build

    - Output directory: frontend/build

4. Functions:

    - Cloudflare automatically deploys files under /functions.

5. Add environment variables (see above).

6. Deploy → Your app will be live at yourapp.pages.dev.



## ✅ Notes

- Cover art and label images come from Discogs. Frontend applies circular mask for transparent display.

- For true transparent PNGs server‑side, integrate Cloudflare Images variants or an external image pipeline.



## 📌 Next Steps

- Extend gallery views for multiple releases/labels.