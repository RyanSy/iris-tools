import React from "react";
import { Paper, Typography, Box, Button } from "@mui/material";

function ImageCard({ 
  title, 
  subtitle, 
  imageUrl, 
  frameRef, 
  onDownload, 
  onClear, 
  circular = false 
}) {
  return (
    <Paper elevation={4} sx={{ p: 2, display: "inline-block", textAlign: "center" }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h6">{title}</Typography>
        {subtitle && (
          <Typography variant="subtitle1">{subtitle}</Typography>
        )}
        <Typography variant="caption" sx={{ fontStyle: "italic", color: "gray" }}>
          Click image to download.
        </Typography>
      </Box>

      <Box
        ref={frameRef}
        sx={{
          mt: 2,
          border: "20px solid black",
          display: "inline-block",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          cursor: "pointer",
          ...(circular
            ? { width: 200, height: 200, borderRadius: "50%", overflow: "hidden" }
            : {}),
        }}
        onClick={onDownload}
      >
        <img
          src={imageUrl}
          alt="Result"
          crossOrigin="anonymous"
          style={{
            maxWidth: circular ? "100%" : "400px",
            height: circular ? "100%" : "auto",
            objectFit: circular ? "cover" : "contain",
            display: "block",
          }}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" color="secondary" onClick={onClear}>
          Clear
        </Button>
      </Box>
    </Paper>
  );
}

export default ImageCard;