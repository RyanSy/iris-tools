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
} from "@mui/material";
import { useApi } from "../utils/api";

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
    vendor: "IRIS Tools",
    tags: "",
    published: true,
  });

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
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

      // Prepare payload
      const payload = {
        ...formData,
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
      tags: "",
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Shopify Product</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {/* Preview Image */}
          {imageData?.previewUrl && (
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <img
                src={imageData.previewUrl}
                alt="Product preview"
                style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px" }}
              />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
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
            <MenuItem value="Frame">Frame</MenuItem>
            <MenuItem value="Coaster">Coaster</MenuItem>
            <MenuItem value="Print">Print</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>

          {/* Vendor */}
          <TextField
            label="Vendor"
            fullWidth
            value={formData.vendor}
            onChange={handleChange("vendor")}
            disabled={loading}
          />

          {/* Tags */}
          <TextField
            label="Tags (comma separated)"
            fullWidth
            value={formData.tags}
            onChange={handleChange("tags")}
            disabled={loading}
            placeholder="vinyl, music, art"
          />

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
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || success}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Creating..." : "Create Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ShopifyModal;
