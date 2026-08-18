import { Layout, Menu, type MenuProps } from "antd";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "../Logo";
import "./AppSider.css";
import { navEntries, paths, type NavEntry } from "@/routes";

type MenuItem = Required<MenuProps>["items"][number];

const { Sider } = Layout;
function getSelectedPath(currentPath: string) {
  const matchingItem = Object.values(paths)
    .filter((x) => currentPath.startsWith(x))
    .reduce((a, b) => (b.length > a.length ? b : a), "");

  if (matchingItem == "/" && currentPath.length > 1) return [];
  return [matchingItem];
}

function toMenuItem(navEntry: NavEntry): MenuItem {
  if (navEntry.type === "divider") return navEntry;
  const Icon = navEntry.icon;
  return {
    key: navEntry.path,
    icon: (
      <span>
        <Icon size={16} />
      </span>
    ),
    label: <Link to={navEntry.path}>{navEntry.label}</Link>,
  } as MenuItem;
}

export default function AppSider() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      theme="light"
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
    >
      <div className={`app-header ${collapsed ? "collapsed" : ""}`}>
        <Logo size={24} className="logo" />
        <span className="app-greeting">Finance Manager</span>
      </div>
      <Menu
        mode="inline"
        items={navEntries.map(toMenuItem)}
        selectedKeys={getSelectedPath(location.pathname)}
      />
    </Sider>
  );
}
