import { useAuth0 } from "@auth0/auth0-react";
import React, { useState } from "react";
import { Typography, Tabs, Tab, Box, Button } from "@mui/material";
import Search from "./pages/Search";

function App() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, error, user } = useAuth0();
  const [tab, setTab] = useState(0);

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (error) {
    return <Box>Error: {error.message}</Box>;
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", height: "100vh", alignItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: "white",
            minWidth: 300,
          }}
        >
          <Typography variant="h6" sx={{ mb: 3 }}>
            IRIS Tools
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => loginWithRedirect()}
          >
            Log In
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
        <Button onClick={() => logout({ returnTo: window.location.origin })}>
          Log Out ({user?.email})
        </Button>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} centered textColor="primary" indicatorColor="primary">
        <Tab label="Frames" />
        <Tab label="Coasters" />
      </Tabs>

      {tab === 0 && <Search mode="cover" />}
      {tab === 1 && <Search mode="label" />}
    </Box>
  );
}

export default App;
