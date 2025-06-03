import type React from "react"
import {
  Home,
  LayoutDashboard,
  ListChecks,
  Package,
  QrCodeIcon as Qrcode,
  Settings,
  ShoppingBag,
  User,
  FileText,
  Shield,
  Award,
} from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"

const routes = [
  {
    href: "/",
    icon: Home,
    label: "Dashboard",
  },
  {
    href: "/collection",
    icon: LayoutDashboard,
    label: "Collection",
  },
  {
    href: "/sales",
    icon: ShoppingBag,
    label: "Sales",
  },
  {
    href: "/products",
    icon: Package,
    label: "Products",
  },
  {
    href: "/categories",
    icon: ListChecks,
    label: "Categories",
  },
  {
    href: "/sizes",
    icon: User,
    label: "Sizes",
  },
  {
    href: "/colors",
    icon: Settings,
    label: "Colors",
  },
  {
    href: "/scan",
    icon: Qrcode,
    label: "Scan QR",
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Audit Trail",
    href: "/audit/logs",
    icon: Shield,
  },
  {
    name: "Certificates",
    href: "/certificates",
    icon: Award,
  },
]

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen antialiased text-foreground">
      <Sidebar routes={routes} />
      <div className="flex-1 p-4">
        <MainNav />
        <main className="container relative pb-20">{children}</main>
      </div>
    </div>
  )
}
