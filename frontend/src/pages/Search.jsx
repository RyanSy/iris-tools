import React, { useState, useRef } from "react";
import { Typography, Box, Alert, CircularProgress } from "@mui/material";
import { useApi } from "../utils/api";
import html2canvas from "html2canvas";
import SearchBar from "../components/SearchBar";
import ImageCard from "../components/ImageCard";
import ShopifyModal from "../components/ShopifyModal";

function Search({ mode = "cover" }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shopifyModalOpen, setShopifyModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { apiFetch } = useApi();
  const frameRefs = useRef([]);
  const inputRef = useRef(null);

  const isLabelMode = mode === "label";
  const endpoint = isLabelMode ? "/api/labels" : "/api/cover";
  const title = isLabelMode ? "Create Label Coaster" : "Create LP Frame";

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const data = await apiFetch(`${endpoint}?query=${encodeURIComponent(query)}`);
      
      // Normalize data structure - always use 'images' array
      let images = [];
      
      if (isLabelMode && data.images && Array.isArray(data.images)) {
        // Label mode: use images array as-is
        images = data.images;
      } else if (data.coverArtUrl) {
        // Cover mode: wrap single cover in array
        images = [data.coverArtUrl];
      } else if (data.images && Array.isArray(data.images)) {
        // Cover mode with multiple images
        images = data.images;
      }
      
      // Proxy all images
      data.proxiedImages = images.map(url => 
        `/api/proxy-image?url=${encodeURIComponent(url)}`
      );
      data.images = images;
      
      // Initialize refs for all images
      frameRefs.current = new Array(images.length);
      
      setResult(data);
    } catch(err) {
      console.error('Search error:', err);
      setError(err.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setQuery("");
    setResult(null);
    setError("");
    frameRefs.current = [];
    inputRef.current?.focus();
  };

  const getFileName = (artist, title, index, totalImages) => {
    const safeArtist = (artist || "unknown").replace(/[^a-z0-9]/gi, "_");
    const safeTitle = (title || "unknown").replace(/[^a-z0-9]/gi, "_");
    const suffix = totalImages > 1 ? `_${index + 1}` : "";
    return `${safeArtist}-${safeTitle}${suffix}.jpg`;
  };

  const capture = (node, filename) => {
    html2canvas(node, { 
      useCORS: true,
      allowTaint: false,
      logging: false
    }).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/jpeg");
      link.download = filename;
      link.click();
    }).catch((err) => {
      console.error("html2canvas error:", err);
      setError("Failed to capture image. Please try again.");
    });
  };

  const handleDownloadFramed = (artist, albumTitle, index = 0) => {
    const totalImages = result.images?.length || 1;
    const filename = getFileName(artist, albumTitle, index, totalImages);
    const node = frameRefs.current[index];
    if (node) {
      const img = node.querySelector("img");
      if (img && !img.complete) {
        img.onload = () => capture(node, filename);
      } else {
        capture(node, filename);
      }
    }
  };

  const handleImageClick = async (artist, albumTitle, index = 0) => {
    const node = frameRefs.current[index];
    if (!node) return;

    try {
      // Capture the image as a blob
      const canvas = await html2canvas(node, { 
        useCORS: true,
        allowTaint: false,
        logging: false
      });
      
      const imageBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
      });

      const previewUrl = canvas.toDataURL("image/jpeg");
      const totalImages = result.images?.length || 1;

      setSelectedImage({
        title: `${artist} — ${albumTitle}${totalImages > 1 ? ` (${index + 1})` : ''}`,
        imageUrl: result.proxiedImages?.[index] || result.images?.[index],
        imageBlob: imageBlob,
        previewUrl: previewUrl,
        artist: artist,
        album: albumTitle,
      });
      
      setShopifyModalOpen(true);
    } catch (err) {
      console.error("Failed to capture image:", err);
      setError("Failed to prepare image for Shopify. Please try again.");
    }
  };

  // Render images (works for both single and multiple)
  const renderImages = () => {
    if (!result.images || result.images.length === 0) {
      return null;
    }

    const totalImages = result.images.length;
    const showCounter = totalImages > 1;

    return (
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        justifyContent: 'center',
        mt: 3 
      }}>
        {result.images.map((imageUrl, index) => (
          <ImageCard
            key={index}
            title={`${result.artist} — ${result.album}${showCounter ? ` (${index + 1}/${totalImages})` : ''}`}
            imageUrl={result.proxiedImages?.[index] || imageUrl}
            frameRef={(el) => (frameRefs.current[index] = el)}
            onDownload={() => handleDownloadFramed(result.artist, result.album, index)}
            onImageClick={() => handleImageClick(result.artist, result.album, index)}
            onClear={clearAll}
            circular={isLabelMode}
          />
        ))}
      </Box>
    );
  };

  return (
    <Box textAlign="center" sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        {title}
      </Typography>

      <SearchBar
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        onClear={clearAll}
        inputRef={inputRef}
      />

      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {result && result.artist && renderImages()}

      <ShopifyModal
        open={shopifyModalOpen}
        onClose={() => setShopifyModalOpen(false)}
        imageData={selectedImage}
      />
    </Box>
  );
}

export default Search;