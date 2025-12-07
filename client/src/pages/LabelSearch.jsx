import React, { useState, useRef } from "react";
import { Typography, Box, Alert, CircularProgress } from "@mui/material";
import { apiFetch } from "../utils/api";
import html2canvas from "html2canvas";
import SearchBar from "../components/SearchBar";
import ImageCard from "../components/ImageCard";

function LabelSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const frameRefs = useRef([]);
  const inputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const data = await apiFetch(`/api/labels?query=${encodeURIComponent(query)}`);
      
      // Proxy all image URLs through our own backend
      if (data.images && Array.isArray(data.images)) {
        data.proxiedImages = data.images.map(url => 
          `/api/proxy-image?url=${encodeURIComponent(url)}`
        );
      }
      
      setResult(data);
      // Initialize refs array for the number of images
      frameRefs.current = data.images ? new Array(data.images.length) : [];
    } catch(err) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setQuery("");
    setResult(null);
    frameRefs.current = [];
    inputRef.current?.focus();
  };

  const getFileName = (artist, title, index) => {
    const safeArtist = (artist || "unknown").replace(/[^a-z0-9]/gi, "_");
    const safeTitle = (title || "unknown").replace(/[^a-z0-9]/gi, "_");
    const suffix = index !== undefined ? `_${index + 1}` : "";
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

  const handleDownloadFramed = (artist, title, index) => {
    const filename = getFileName(artist, title, index);
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

  return (
    <Box textAlign="center" sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        Create Label Coaster
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

      {result && result.artist && result.images && result.images.length > 0 && (
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
              title={`${result.artist} — ${result.album} ${result.images.length > 1 ? `(${index + 1}/${result.images.length})` : ''}`}
              imageUrl={result.proxiedImages?.[index] || imageUrl}
              frameRef={(el) => (frameRefs.current[index] = el)}
              onDownload={() => handleDownloadFramed(result.artist, result.album, index)}
              onClear={clearAll}
              circular={true}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default LabelSearch;