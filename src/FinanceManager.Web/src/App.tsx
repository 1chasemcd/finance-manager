import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import TransactionsPage from "./pages/TransactionsPage/TransactionsPage";
import Import from "./pages/Import";
import CategoriesPage from "./pages/Categories/CategoriesPage";
import Budget from "./pages/Budget";
import Patterns from "./pages/Patterns";
import AccountsPage from "./pages/Accounts/AccountsPage";
import People from "./pages/People";
import ImportDefinitions from "./pages/ImportDefinitions";
import AccountsAddPage from "./pages/Accounts/AccountsAddPage";
import AccountsEditPage from "./pages/Accounts/AccountsEditPage";
import NotFound from "./pages/NotFound";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/import" element={<Import />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/accounts">
            <Route index element={<AccountsPage />} />
            <Route path="add" element={<AccountsAddPage />} />
            <Route path=":id/edit" element={<AccountsEditPage />} />
          </Route>
          <Route path="/importdefs" element={<ImportDefinitions />} />
          <Route path="/patterns" element={<Patterns />} />
          <Route path="/people" element={<People />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
