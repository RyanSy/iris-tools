import React, { useState } from "react";
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

function ShopifyModal({ open, onClose, imageData }) {
  const { apiFetch } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: imageData?.title || "",
    description: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    inventory: "",
    productType: "Frame",
    selectedTags: [],
    published: true,
  });

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
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.title || !formData.price) {
        throw new Error("Title and Price are required");
      }

      // Prepare payload with tags as comma-separated string
      const payload = {
        ...formData,
        tags: formData.selectedTags.join(", "),
        imageUrl: imageData.imageUrl,
        imageBlob: imageData.imageBlob, // Canvas-captured image data
      };

      const response = await apiFetch("/api/shopify/create-product", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
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
      productType: "Frame",
      vendor: "IRIS Tools",
      selectedTags: [],
      published: true,
    });
    setError("");
    setSuccess(false);
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
                border: "15px solid #000",
                backgroundColor: "#000",
                boxSizing: "border-box",
                maxWidth: "360px",
                width: "100%",
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
                }}
              />
            </Box>
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
              Product Image Preview
            </Typography>
          </Box>
        )}

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Product created successfully!</Alert>}

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
          disabled={loading || success}
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