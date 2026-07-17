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
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import { NavLink } from "react-router-dom"
import { Separator } from "./ui/separator"

const menuItems = [
  [
    {
      text: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      text: "Transactions",
      href: "/transactions",
      icon: Banknote,
    },
    {
      text: "Import",
      href: "/import",
      icon: FileUp,
    },
  ],
  [
    {
      text: "Budget",
      href: "/budget",
      icon: Scale,
    },
    {
      text: "Categories",
      href: "/categories",
      icon: FolderTree,
    },
    {
      text: "Accounts",
      href: "/accounts",
      icon: Landmark,
    },
    {
      text: "Import Definitions",
      href: "/importdefs",
      icon: FileCog,
    },
    {
      text: "Patterns",
      href: "/patterns",
      icon: Asterisk,
    },
    {
      text: "People",
      href: "/people",
      icon: Users,
    },
  ],
]

export default function MainSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        {menuItems.map((group, index) => (
          <div key={index}>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.map((item) => (
                    <SidebarMenuItem key={item.text}>
                      <NavLink to={item.href}>
                        {({ isActive }) => (
                          <SidebarMenuButton
                            className="text-base [&>svg]:size-5"
                            isActive={isActive}
                          >
                            <item.icon />
                            <span>{item.text}</span>
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {index != menuItems.length - 1 && <Separator />}
          </div>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
