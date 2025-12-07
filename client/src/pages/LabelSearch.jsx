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

  const frameRef = useRef(null);
  const inputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const data = await apiFetch(`/api/labels?query=${encodeURIComponent(query)}`);
      
      // Proxy the image URL through our own backend
      if (data.coverArtUrl) {
        data.proxiedCoverArtUrl = `/api/proxy-image?url=${encodeURIComponent(data.coverArtUrl)}`;
      }
      
      setResult(data);
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
    inputRef.current?.focus();
  };

  const getFileName = (artist, title) => {
    const safeArtist = (artist || "unknown").replace(/[^a-z0-9]/gi, "_");
    const safeTitle = (title || "unknown").replace(/[^a-z0-9]/gi, "_");
    return `${safeArtist}-${safeTitle}.jpg`;
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

  const handleDownloadFramed = (artist, title) => {
    const filename = getFileName(artist, title);
    const node = frameRef.current;
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

      {result && result.artist && (
        <ImageCard
          title={`${result.artist} — ${result.album}`}
          imageUrl={result.proxiedCoverArtUrl || result.coverArtUrl}
          frameRef={frameRef}
          onDownload={() => handleDownloadFramed(result.artist, result.album)}
          onClear={clearAll}
          circular={true}
        />
      )}
    </Box>
  );
}

export default LabelSearch;