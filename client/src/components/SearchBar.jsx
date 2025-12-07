import React from "react";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

function SearchBar({ query, setQuery, onSearch, onClear, inputRef }) {
  return (
    <form
      onSubmit={onSearch}
      style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px" }}
    >
      <TextField
        inputRef={inputRef}
        label="Artist, title or catalog number"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ width: 320 }}
        required
      />
      <Button type="submit" variant="contained" color="primary" aria-label="Search">
        <SearchIcon />
      </Button>
    </form>
  );
}

export default SearchBar;