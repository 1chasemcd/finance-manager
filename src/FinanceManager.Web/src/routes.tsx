import {
  Asterisk,
  Banknote,
  FileCog,
  FileUp,
  FolderTree,
  Landmark,
  LayoutDashboard,
  Scale,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Import from "./pages/Import";
import Budget from "./pages/Budget";
import Categories from "./pages/Categories";
import TransactionSources from "./pages/TransactionSources";
import ImportDefinitions from "./pages/ImportDefinitions";
import Patterns from "./pages/Patterns";
import TransactionSourceUpdate from "./pages/TransactionSourceUpdate";
import TransactionSourceCreate from "./pages/TransactionSourceCreate";
import People from "./pages/People/People";
import PersonUpdate from "./pages/People/PersonUpdate";
import PersonCreate from "./pages/People/PersonCreate";

export const paths = {
  dashboard: "/",
  transactions: "/transactions",
  import: "/import",
  categories: "/categories",
  budget: "/budget",
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
    path: paths.budget,
    label: "Budget",
    icon: Scale,
    element: <Budget />,
  }),
  route({
    path: paths.categories,
    label: "Categories",
    icon: FolderTree,
    element: <Categories />,
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
