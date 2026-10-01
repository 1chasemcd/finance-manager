import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { RouterProvider } from "react-router";
import { router } from "./routes.ts";

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <CssBaseline>
      <RouterProvider router={router} />
    </CssBaseline>
  </StrictMode>,
);
