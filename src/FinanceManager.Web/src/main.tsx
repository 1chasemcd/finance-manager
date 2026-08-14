import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { purple } from "@ant-design/colors";

const client = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: purple.primary!,
        },
      }}
    >
      <QueryClientProvider client={client}>
        <App />
      </QueryClientProvider>
    </ConfigProvider>
  </StrictMode>,
);
