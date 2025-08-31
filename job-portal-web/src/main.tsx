import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ClerkProvider } from "@clerk/clerk-react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

import "./index.css";
import App from "./App";
import { reportWebVitals } from "./lib/webVitals/vitals";

// Store: expect src/store/index.ts to export a configured store
// Fallback to a minimal store if not present (useful during scaffolding)
let store: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  store = require("./store").store;
} catch {
  const { configureStore, createSlice } = require("@reduxjs/toolkit");
  const dummy = createSlice({ name: "dummy", initialState: {}, reducers: {} });
  store = configureStore({ reducer: { dummy: dummy.reducer } });
}

// Theme: if you have a custom theme export in ./theme, prefer it
let theme: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  theme = require("./theme").default;
} catch {
  theme = createTheme({
    palette: { mode: "light" },
    shape: { borderRadius: 12 },
    components: { MuiButton: { styleOverrides: { root: { textTransform: "none" } } } },
  });
}

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
if (!clerkKey) {
  // eslint-disable-next-line no-console
  console.error("VITE_CLERK_PUBLISHABLE_KEY is not set. Clerk auth will not work.");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkKey}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </ClerkProvider>
  </React.StrictMode>
);

// Optional: log web vitals (replace with your analytics hook if desired)
reportWebVitals();
