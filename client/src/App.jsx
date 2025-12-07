import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import CoverSearch from "./pages/CoverSearch";
import LabelSearch from "./pages/LabelSearch";

function App() {
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tabs navigation */}
      <Tabs
        value={tab}
        onChange={handleChange}
        centered
        textColor="primary"
        indicatorColor="primary"
        sx={{ mt: 3, mb: 3 }}
      >
        <Tab label="Frames" />
        <Tab label="Coasters" />
      </Tabs>

      {/* Tab content */}
      {tab === 0 && <CoverSearch />}
      {tab === 1 && <LabelSearch />}
    </Box>
  );
}

export default App;