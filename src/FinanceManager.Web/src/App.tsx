import { BrowserRouter, Route, Routes } from "react-router-dom";
import { navEntries } from "@/routes";
import AppLayout from "./layouts/AppLayout";
import NotFound from "./pages/NotFound";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {navEntries
            .filter((entry) => entry.type !== "divider")
            .map((entry) => (
              <Route path={entry.path}>
                {<Route index element={entry.element} />}
                {entry.children?.map((child) => (
                  <Route path={child.path} element={child.element} />
                ))}
              </Route>
            ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
