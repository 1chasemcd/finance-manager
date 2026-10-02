import { createBrowserRouter, type RouteObject } from "react-router";
import AppLayout from "./layouts/AppLayout";
import { type SvgIconProps } from "@mui/material/SvgIcon";
import {
  AccountBalance,
  Category,
  CloudUpload,
  Dashboard as DashboardIcon,
  Description,
  People,
  Payments,
  Rule,
} from "@mui/icons-material";
import type React from "react";
import FileFormats from "./pages/FileFormats";
import Sources from "./pages/Sources";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import ImportBatch from "./pages/ImportBatch";
import Categories from "./pages/Categories";
import CategoryRules from "./pages/CategoryRules";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";

export const paths = {
  dashboard: "/",
  transactions: "/transactions",
  import: "/importbatch",
  categories: "/categories",
  sources: "/sources",
  fileFormats: "/fileformats",
  categoryRules: "/categoryrules",
  account: "/account",
  notFound: "*",
};

type RouteEntry = {
  type: "route";
  path: string;
  label: string;
  Icon: React.ComponentType<SvgIconProps>;
  Component: React.ComponentType;
};

function route(entry: Omit<RouteEntry, "type">): RouteEntry {
  return { ...entry, type: "route" };
}

export const navEntries: RouteEntry[] = [
  route({
    path: paths.dashboard,
    label: "Dashboard",
    Icon: DashboardIcon,
    Component: Dashboard,
  }),
  route({
    path: paths.transactions,
    label: "Transactions",
    Icon: Payments,
    Component: Transactions,
  }),
  route({
    path: paths.import,
    label: "Import Batch",
    Icon: CloudUpload,
    Component: ImportBatch,
  }),
  route({
    path: paths.categories,
    label: "Categories",
    Icon: Category,
    Component: Categories,
  }),
  route({
    path: paths.sources,
    label: "Sources",
    Icon: AccountBalance,
    Component: Sources,
  }),
  route({
    path: paths.fileFormats,
    label: "File Formats",
    Icon: Description,
    Component: FileFormats,
  }),
  route({
    path: paths.categoryRules,
    label: "Category Rules",
    Icon: Rule,
    Component: CategoryRules,
  }),
  route({
    path: paths.account,
    label: "Account",
    Icon: People,
    Component: Account,
  }),
];

function transformRouteEntry(entry: RouteEntry): RouteObject {
  const route: RouteObject = {
    index: entry.path == "/",
    Component: entry.Component,
  };

  if (entry.path != "/") route.path = entry.path;

  return route;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      ...navEntries.map(transformRouteEntry),
      { path: paths.notFound, Component: NotFound },
    ],
  },
]);
