import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntdApp } from "antd";
import { purple } from "@ant-design/colors";
import enUS from "antd/locale/en_US";

const client = new QueryClient();

const validateMessages = {
  required: "${label} is required",
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      locale={enUS}
      theme={{
        token: {
          colorPrimary: purple.primary!,
        },
      }}
      form={{ validateMessages }}
    >
      <AntdApp>
        <QueryClientProvider client={client}>
          <App />
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  </StrictMode>,
);
