import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import "@/lib/dayjs";

import Providers from "@/lib/providers";
import { setupSentry } from "@/lib/telemetry";

setupSentry();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers />
  </React.StrictMode>,
);
