import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import "@/lib/dayjs";

import Providers from "@/lib/providers";
import { setupSentry } from "@/lib/telemetry";

setupSentry();

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Providers />
  </React.StrictMode>,
);
