import {
  Asterisk,
  Banknote,
  FileCog,
  FileUp,
  FolderTree,
  Landmark,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions/Transactions";
import Import from "./pages/Import";
import TransactionCategories from "./pages/TransactionCategories/TransactionCategories";
import TransactionSources from "./pages/TransactionSources/TransactionSources";
import ImportDefinitions from "./pages/ImportDefinitions";
import Patterns from "./pages/Patterns";
import TransactionSourceUpdate from "./pages/TransactionSources/TransactionSourceUpdate";
import TransactionSourceCreate from "./pages/TransactionSources/TransactionSourceCreate";
import People from "./pages/People/People";
import PersonUpdate from "./pages/People/PersonUpdate";
import PersonCreate from "./pages/People/PersonCreate";
import TransactionCategoryUpdate from "./pages/TransactionCategories/TransactionCategoryUpdate";
import TransactionCategoryCreate from "./pages/TransactionCategories/TransactionCategoryCreate";

export const paths = {
  dashboard: "/",
  transactions: "/transactions",
  import: "/import",
  categories: "/categories",
  transactionSources: "/sources",
  importDefs: "/importdefs",
  patterns: "/patterns",
  people: "/people",
};

type ChildRoute = {
  path: string;
  element: ReactNode;
};

function editFormRoute(element: ReactNode): ChildRoute {
  return { path: ":id/edit", element };
}

function addFormRoute(element: ReactNode): ChildRoute {
  return { path: "add", element };
}

type RouteEntry = {
  type: "route";
  path: string;
  label: string;
  icon: LucideIcon;
  element: ReactNode;
  children?: ChildRoute[];
};

function route(entry: Omit<RouteEntry, "type">): RouteEntry {
  return { ...entry, type: "route" };
}

type Divider = { type: "divider" };
function divider(): Divider {
  return { type: "divider" };
}

export type NavEntry = RouteEntry | Divider;

export const navEntries: NavEntry[] = [
  route({
    path: paths.dashboard,
    label: "Dashboard",
    icon: LayoutDashboard,
    element: <Dashboard />,
  }),
  route({
    path: paths.transactions,
    label: "Transactions",
    icon: Banknote,
    element: <Transactions />,
  }),
  route({
    path: paths.import,
    label: "Import",
    icon: FileUp,
    element: <Import />,
  }),
  divider(),
  route({
    path: paths.categories,
    label: "Categories",
    icon: FolderTree,
    element: <TransactionCategories />,
    children: [
      editFormRoute(<TransactionCategoryUpdate />),
      addFormRoute(<TransactionCategoryCreate />),
    ],
  }),
  route({
    path: paths.transactionSources,
    label: "Sources",
    icon: Landmark,
    element: <TransactionSources />,
    children: [
      editFormRoute(<TransactionSourceUpdate />),
      addFormRoute(<TransactionSourceCreate />),
    ],
  }),
  route({
    path: paths.importDefs,
    label: "Import Definitions",
    icon: FileCog,
    element: <ImportDefinitions />,
  }),
  route({
    path: paths.patterns,
    label: "Patterns",
    icon: Asterisk,
    element: <Patterns />,
  }),
  route({
    path: paths.people,
    label: "People",
    icon: Users,
    element: <People />,
    children: [editFormRoute(<PersonUpdate />), addFormRoute(<PersonCreate />)],
  }),
];
