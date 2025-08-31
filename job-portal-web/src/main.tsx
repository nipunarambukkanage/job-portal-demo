import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ClerkProvider } from "@clerk/clerk-react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

import "./index.css";
import App from "./App";
import reportWebVitals from "./lib/webVitals/vitals";
import { store } from "./store";
import { buildTheme } from "./theme";

//TODO: move to .env and get it from therre
const clerkPublishableKey = "pk_test_dHJ1c3RlZC1zd2FuLTQ0LmNsZXJrLmFjY291bnRzLmRldiQ";
if (!clerkPublishableKey) {
  console.error("VITE_CLERK_PUBLISHABLE_KEY is not set. Clerk auth will not work.");
}

const theme = buildTheme("light");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
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

// Optional: log web vitals
reportWebVitals();