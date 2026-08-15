import { Layout, Menu, type MenuProps } from "antd";
import {
  LayoutDashboard,
  Banknote,
  FileUp,
  Scale,
  Asterisk,
  Landmark,
  FileCog,
  Users,
  FolderTree,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "../Logo";
import "./AppSider.css";

type MenuItem = Required<MenuProps>["items"][number];
const { Sider } = Layout;

function menuItem(label: string, path: string, Icon: LucideIcon): MenuItem {
  return {
    key: path,
    icon: (
      <span>
        <Icon size={16} />
      </span>
    ),
    label: <Link to={path}>{label}</Link>,
  } as MenuItem;
}

function divider(): MenuItem {
  return {
    type: "divider",
  };
}

const items: MenuItem[] = [
  divider(),
  menuItem("Dashboard", "/", LayoutDashboard),
  menuItem("Transactions", "/transactions", Banknote),
  menuItem("Import", "/import", FileUp),
  divider(),
  menuItem("Budget", "/budget", Scale),
  menuItem("Categories", "/categories", FolderTree),
  menuItem("Accounts", "/accounts", Landmark),
  menuItem("Import Definitions", "/importdefs", FileCog),
  menuItem("Patterns", "/patterns", Asterisk),
  menuItem("People", "/people", Users),
];

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
        items={items}
        selectedKeys={[
          items
            .map((x) => x?.key?.toString())
            .filter((x) => x != undefined)
            .filter((x) => location.pathname.startsWith(x))
            .reduce((a, b) => (b.length > a.length ? b : a)),
        ]}
      />
    </Sider>
  );
}
