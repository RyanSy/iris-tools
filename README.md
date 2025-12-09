# IRIS Tools

A web application for creating custom album art frames and vinyl label coasters. Search for any album and download high-quality images.


## Features

### Album Frames
- Find album cover art using artist name, album title, or catalog number
- Generate square frame designs perfect for 12" LP displays
- Download high-resolution JPGs ready for upload to e-commerce sites

### Vinyl Label Coasters
- Find vinyl center label images from Discogs database
- Creates circular designs ideal for drink coasters
- Supports multiple label variants per release
- Batch download all labels from a single album

### Image Processing
- Proxy images through backend to avoid CORS issues
- Apply circular masks for label coasters
- HTML5 canvas rendering for clean downloads
- Customized filenames based on artist and album


## Quick Start

### Prerequisites
- Node.js 16+ 
- Discogs API Personal Access Token ([Get one here](https://www.discogs.com/settings/developers))

### Installation

```bash
# Clone the repository
git clone https://github.com/RyanSy/iris-tools.git
cd iris-tools

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
DISCOGS_TOKEN=your_discogs_token_here
NODE_ENV=development
```

### Running Locally

```bash
# Start the backend server (from root directory)
npm run dev

# In a new terminal, start the frontend (from client directory)
cd client
npm run dev
```

The React app will open at `http://localhost:5173/`


## Architecture

### Backend (Express.js)
- `/api/cover` - Search for album cover art
- `/api/labels` - Search for vinyl center labels (returns array)
- `/api/proxy-image` - Proxy external images to avoid CORS

### Frontend (React + Material-UI)
- **Search Component** - Unified search interface for both modes
- **ImageCard Component** - Displays and downloads formatted images
- **Tab Navigation** - Switch between Frames and Coasters views

### Tech Stack
- **Frontend**: React, Material-UI, html2canvas
- **Backend**: Express.js, Node.js
- **APIs**: Discogs API
- **Image Processing**: Sharp (backend), html2canvas (frontend)


## Development

### Project Structure
```
iris-tools/
├── client/                     # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── Search.jsx      # Main search component
│   │   ├── components/
│   │   │   ├── SearchBar.jsx
│   │   │   └── ImageCard.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
├── routes/
│   ├── cover.js                # Cover art API route
│   └── labels.js               # Labels API route
├── app.js                      # Express server
└── package.json
```

### API Response Formats

**Cover Search Response:**
```json
{
  "artist": "Pink Floyd",
  "album": "The Dark Side of the Moon",
  "coverArtUrl": "https://..."
}
```

**Labels Search Response:**
```json
{
  "artist": "Pink Floyd",
  "album": "The Dark Side of the Moon",
  "images": [
    "https://label-url-1.jpg",
    "https://label-url-2.jpg"
  ]
}
```

## 📧 Contact

Ryan - [@RyanSy](https://github.com/RyanSy)

Project Link: [https://github.com/RyanSy/iris-tools](https://github.com/RyanSy/iris-tools)

---

Artifacts:
https://claude.ai/public/artifacts/93d1c514-1afa-44cc-9482-163a4337c10c
https://claude.ai/public/artifacts/15beedc5-481d-435e-8b0b-dfb040e1505b
https://claude.ai/public/artifacts/dd253783-b4d3-4ca1-bc10-175ab9b629b8
https://claude.ai/public/artifacts/fe5ddd2b-4f43-4633-b13d-3413c7680c14
https://claude.ai/public/artifacts/9f7c6ae1-c48e-4748-ab11-548890ee72e1
https://claude.ai/public/artifacts/d726906f-126f-45f3-8268-20725c93207d
https://claude.ai/public/artifacts/a3f1467a-9b78-4f47-9159-9a1a9e80cbfc

**Note**: This tool is for personal use only. Please respect copyright and only use images you have the right to reproduce.
