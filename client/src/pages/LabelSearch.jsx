import React, { useState, useRef } from "react";
import { Typography, Box, Alert, CircularProgress, Grid } from "@mui/material";
import { apiFetch } from "../utils/api";
import html2canvas from "html2canvas";
import SearchBar from "../components/SearchBar";
import ImageCard from "../components/ImageCard";

function LabelSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const frameRefs = useRef({});
  const inputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setResults([]);
    setLoading(true);

    try {
      const data = await apiFetch(`/api/labels?query=${encodeURIComponent(query)}`);
      console.log('fuck you');
      setResults(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const getFileName = (artist, title) => {
    const safeArtist = artist.replace(/[^a-z0-9]/gi, "_");
    const safeTitle = title.replace(/[^a-z0-9]/gi, "_");
    return `${safeArtist}-${safeTitle}.jpg`;
  };

  const capture = (node, filename) => {
    html2canvas(node, { useCORS: true }).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/jpeg");
      link.download = filename;
      link.click();
    });
  };

  const handleDownloadFramed = (artist, title, index) => {
    const filename = getFileName(artist, title);
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
    <Box textAlign="center" sx={{ mt: 9 }}>
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

      <Grid container spacing={2} justifyContent="center">
        {results.map((label, i) => (
          <Grid item key={i}>
            <ImageCard
              title={`${label.artist} — ${label.title}`}
              imageUrl={label.labelImageUrl}
              frameRef={(el) => (frameRefs.current[i] = el)}
              onDownload={() => handleDownloadFramed(label.artist, label.title, i)}
              onClear={clearAll}
              circular={true}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default LabelSearch;