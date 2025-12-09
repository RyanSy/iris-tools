import React from "react";
import { Card, CardContent, CardActions, Button, Typography, Box } from "@mui/material";

function ImageCard({ title, imageUrl, frameRef, onDownload, onImageClick, onClear, circular = false }) {
  return (
    <Card sx={{ maxWidth: 400, width: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box
          ref={frameRef}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
            padding: circular ? 2 : 0, // No padding for frames
            cursor: onImageClick ? "pointer" : "default",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": onImageClick ? {
              transform: "scale(1.02)",
              boxShadow: 3,
            } : {},
          }}
          onClick={onImageClick}
          title={onImageClick ? "Click to add to Shopify" : ""}
        >
          <Box
            sx={{
              border: circular ? "none" : "20px solid #000", // Black frame for non-circular
              display: "inline-block",
              backgroundColor: "#000",
            }}
          >
            <img
              src={imageUrl}
              alt={title}
              style={{
                display: "block",
                maxWidth: circular ? "100%" : "360px",
                width: circular ? "auto" : "360px",
                height: "auto",
                borderRadius: circular ? "50%" : "0",
                aspectRatio: "1/1",
                objectFit: "cover",
              }}
              crossOrigin="anonymous"
            />
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", px: 2 }}>
        <Button size="small" onClick={onDownload} variant="contained">
          Download
        </Button>
        <Button size="small" onClick={onClear} color="secondary">
          Clear
        </Button>
      </CardActions>
    </Card>
  );
}

export default ImageCard;