import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  FormGroup,
  FormLabel,
} from "@mui/material";
import { useApi } from "../utils/api";

const GENRE_TAGS = [
  "Alternative Rock",
  "Blues",
  "Broadway",
  "Children's",
  "Christian",
  "Classic Rock",
  "Classical",
  "Comedy",
  "Country",
  "Current R&B",
  "Disco",
  "Disco/House",
  "Easy Listening",
  "Eighties",
  "Electronic",
  "Folk",
  "Hard Rock",
  "Heavy Metal",
  "Hip Hop",
  "Holiday",
  "Jazz",
  "Kitsch",
  "Latin",
  "Oddities",
  "Oldies",
  "Pop",
  "Pop Vocals",
  "Punk/New Wave",
  "Reggae/World",
  "Soft Rock",
  "Soundtracks",
  "Soul",
  "Spoken Word",
];

const PRODUCT_TYPE_TAGS = [
  "45 Coasters",
  "LP Coasters",
  "Coaster Sets",
  "Framed Album Covers",
];

const MISC_TAGS = [
  "Beautiful Design",
  "Just One Color",
  "Premium Coasters",
  "Non-Music Image",
];

function ShopifyModal({ open, onClose, imageData, mode = "cover", onSuccess }) {
  const { apiFetch } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isCoasterMode = mode === "label";

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    inventory: "",
    productType: isCoasterMode ? "Coaster" : "Frame",
    selectedTags: [],
    published: true,
  });

  // Update form when imageData changes
  useEffect(() => {
    if (imageData && open) {
      const artist = imageData.artist || "Unknown Artist";
      const album = imageData.album || "Unknown Album";
      
      // Generate appropriate title based on mode
      const productTitle = isCoasterMode 
        ? `${album} Groovy Coaster - ${artist}`
        : imageData.title || `${artist} — ${album}`;
      
      // Auto-select tags based on mode and imageData
      const autoTags = [];
      if (isCoasterMode) {
        autoTags.push("LP Coasters");
      } else {
        autoTags.push("Framed Album Covers");
      }
      
      // Add genre tags if available
      if (imageData.tags && Array.isArray(imageData.tags)) {
        imageData.tags.forEach(tag => {
          if (GENRE_TAGS.includes(tag)) {
            autoTags.push(tag);
          }
        });
      }

      setFormData(prev => ({
        ...prev,
        title: productTitle,
        productType: isCoasterMode ? "Coaster" : "Frame",
        selectedTags: autoTags,
      }));
    }
  }, [imageData, open, isCoasterMode]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.price) {
        throw new Error("Title and Price are required");
      }

      // Convert Blob to base64 string
      let imageBase64 = null;
      if (imageData.imageBlob) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageData.imageBlob);
        });
      }

      // Prepare payload with tags as comma-separated string
      const payload = {
        ...formData,
        tags: formData.selectedTags.join(", "),
        imageBlob: imageBase64, // Now a base64 string
      };

      const response = await apiFetch("/api/shopify/create-product", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Call success callback and close modal
      if (onSuccess) {
        onSuccess();
      }
      resetForm();
    } catch (err) {
      console.error("Shopify create error:", err);
      setError(err.message || "Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      compareAtPrice: "",
      sku: "",
      inventory: "",
      productType: isCoasterMode ? "Coaster" : "Frame",
      selectedTags: [],
      published: true,
    });
    setError("");
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ padding: 4 }}>Create Shopify Product</DialogTitle>
      <DialogContent sx={{ maxHeight: "70vh", overflowY: "auto", padding: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {/* Preview Image */}
          {imageData?.previewUrl && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2,
                p: 2,
                border: "1px solid #ccc",
                borderRadius: 2,
                backgroundColor: "#f9f9f9",
              }}
            >
              <Box
                sx={{
                  border: isCoasterMode ? "none" : "15px solid #000",
                  backgroundColor: isCoasterMode ? "transparent" : "#000",
                  boxSizing: "border-box",
                  maxWidth: "360px",
                  width: "100%",
                  padding: isCoasterMode ? 0 : 0,
                }}
              >
                <img
                  src={imageData.previewUrl}
                  alt="Product preview"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                    borderRadius: isCoasterMode ? "50%" : "0",
                  }}
                />
              </Box>
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                Product Image Preview ({isCoasterMode ? "Coaster" : "Frame"})
              </Typography>
            </Box>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {/* Title */}
          <TextField
            label="Product Title *"
            fullWidth
            value={formData.title}
            onChange={handleChange("title")}
            disabled={loading}
          />

          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange("description")}
            disabled={loading}
          />

          {/* Price & Compare At Price */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Price *"
              fullWidth
              type="number"
              value={formData.price}
              onChange={handleChange("price")}
              disabled={loading}
              InputProps={{ startAdornment: "$" }}
            />
            <TextField
              label="Compare At Price"
              fullWidth
              type="number"
              value={formData.compareAtPrice}
              onChange={handleChange("compareAtPrice")}
              disabled={loading}
              InputProps={{ startAdornment: "$" }}
            />
          </Box>

          {/* SKU & Inventory */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="SKU"
              fullWidth
              value={formData.sku}
              onChange={handleChange("sku")}
              disabled={loading}
            />
            <TextField
              label="Inventory"
              fullWidth
              type="number"
              value={formData.inventory}
              onChange={handleChange("inventory")}
              disabled={loading}
            />
          </Box>

          {/* Product Type */}
          <TextField
            label="Product Type"
            fullWidth
            select
            value={formData.productType}
            onChange={handleChange("productType")}
            disabled={loading}
          >
            <MenuItem value="Frame">LP Frame</MenuItem>
            <MenuItem value="Coaster">Coaster</MenuItem>
          </TextField>

          {/* Tags */}
          <Box>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: "bold" }}>
              Product Type Tags
            </FormLabel>
            <FormGroup row>
              {PRODUCT_TYPE_TAGS.map((tag) => (
                <FormControlLabel
                  key={tag}
                  control={
                    <Checkbox
                      checked={formData.selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      disabled={loading}
                    />
                  }
                  label={tag}
                />
              ))}
            </FormGroup>
          </Box>

          <Box>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: "bold" }}>
              Genre Tags
            </FormLabel>
            <FormGroup row>
              {GENRE_TAGS.map((tag) => (
                <FormControlLabel
                  key={tag}
                  control={
                    <Checkbox
                      checked={formData.selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      disabled={loading}
                    />
                  }
                  label={tag}
                  sx={{ minWidth: "200px" }}
                />
              ))}
            </FormGroup>
          </Box>

          <Box>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: "bold" }}>
              Miscellaneous Tags
            </FormLabel>
            <FormGroup row>
              {MISC_TAGS.map((tag) => (
                <FormControlLabel
                  key={tag}
                  control={
                    <Checkbox
                      checked={formData.selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      disabled={loading}
                    />
                  }
                  label={tag}
                />
              ))}
            </FormGroup>
          </Box>

          {/* Published */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.published}
                onChange={handleChange("published")}
                disabled={loading}
              />
            }
            label="Publish product immediately"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: 4 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Creating..." : "Create Product"}
        </Button>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ShopifyModal;