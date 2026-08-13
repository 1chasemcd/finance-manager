import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Import from "./pages/Import";
import Categories from "./pages/Categories";
import Budget from "./pages/Budget";
import Patterns from "./pages/Patterns";
import Accounts from "./pages/Accounts";
import People from "./pages/People";
import ImportDefinitions from "./pages/ImportDefinitions";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/import" element={<Import />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/importdefs" element={<ImportDefinitions />} />
          <Route path="/patterns" element={<Patterns />} />
          <Route path="/people" element={<People />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
