import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App";
import reportWebVitals from "./lib/webVitals/vitals";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
