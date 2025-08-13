import type React from "react"
import { LayoutDashboard, ListChecks, ListTree, Settings, Scan, HelpCircle } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
}

const AppSidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Data Catalog",
      url: "/data-catalog",
      icon: ListTree,
    },
    {
      title: "Data Quality",
      url: "/data-quality",
      icon: ListChecks,
    },
  ]

  const dataMapItems = [
    {
      title: "Scan",
      url: "/data-governance/scan",
      icon: Scan,
    },
    {
      title: "Scan Rules",
      url: "/data-governance/scan-rules",
      icon: Settings,
    },
    {
      title: "Settings",
      url: "/data-governance/settings",
      icon: Settings,
    },
  ]

  const helpItems = [
    {
      title: "Help",
      url: "/help",
      icon: HelpCircle,
    },
  ]

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-100 border-r border-gray-200 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4">
        <h1 className="text-2xl font-bold">Data Governance</h1>
      </div>

      <nav className="mt-6">
        <h2 className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">Main</h2>
        <ul>
          {menuItems.map((item) => (
            <li key={item.title} className="px-4 py-2 hover:bg-gray-200">
              <a href={item.url} className="flex items-center">
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <nav className="mt-6">
        <h2 className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">Data Map</h2>
        <ul>
          {dataMapItems.map((item) => (
            <li key={item.title} className="px-4 py-2 hover:bg-gray-200">
              <a href={item.url} className="flex items-center">
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <nav className="mt-6">
        <h2 className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">Help</h2>
        <ul>
          {helpItems.map((item) => (
            <li key={item.title} className="px-4 py-2 hover:bg-gray-200">
              <a href={item.url} className="flex items-center">
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export { AppSidebar }
