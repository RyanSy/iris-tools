# Album Cover & Vinyl Label Finder

A Cloudflare Pages app with Functions backend and React frontend:
- 🔒 Google SSO authentication (OAuth 2.0 / OpenID Connect)
- 🎨 Cover art search via MusicBrainz + Cover Art Archive
- 💿 Vinyl center label search via Discogs
- 🛡️ Both endpoints protected by Google login



## 🚀 Features
- **Cover Search**: Enter album title or catalog number → fetch cover art.
- **Label Search**: Enter artist, title, or catalog number → fetch vinyl center labels.
- **Authentication**: Google SSO required to access both endpoints.
- **Frontend**: React app with two routes (`/` for covers, `/labels` for labels).
- **Backend**: Cloudflare Pages Functions handle API calls and authentication.



## 🔑 Environment Variables

Set these in **Cloudflare Pages → Project Settings → Environment Variables**:

- `GOOGLE_CLIENT_ID` → OAuth client ID from Google Cloud Console
- `GOOGLE_CLIENT_SECRET` → OAuth client secret
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



## 🔒 Authentication Flow
1. User clicks Sign in with Google (/api/auth/login).

2. Redirected to Google OAuth screen.

3. On success → /api/auth/callback verifies ID token and sets secure cookie.

4. Protected endpoints (/api/cover, /api/labels) check cookie before serving data.

5. React frontend wraps pages in <AuthGuard> to enforce login.



## ✅ Notes
- Cover art comes from MusicBrainz + Cover Art Archive.

- Label images come from Discogs. Frontend applies circular mask for transparent display.

- For true transparent PNGs server‑side, integrate Cloudflare Images variants or an external image pipeline.

- Both endpoints require valid Google session.



## 📌 Next Steps
- Add a Sign out endpoint if you want users to clear cookies.

- Extend gallery views for multiple releases/labels.

- Restrict access to specific Google Workspace domains if needed.