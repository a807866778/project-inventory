"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";

interface DashboardSidebarProps {
  user: {
    id: string;
    username: string;
    realName: string;
    permissions: string[];
  };
}

const menuItems = [
  {
    title: "工作台",
    href: "/dashboard",
    icon: "📊",
    permission: "dashboard:view",
  },
  {
    title: "物料管理",
    href: "/materials",
    icon: "📦",
    permission: "material:view",
  },
  {
    title: "入库管理",
    href: "/inbound",
    icon: "📥",
    permission: "inbound:view",
  },
  {
    title: "出库管理",
    href: "/outbound",
    icon: "📤",
    permission: "outbound:view",
  },
  {
    title: "项目管理",
    href: "/projects",
    icon: "🏗️",
    permission: "project:view",
  },
  {
    title: "供应商",
    href: "/suppliers",
    icon: "🏢",
    permission: "supplier:view",
  },
  {
    title: "收益报表",
    href: "/reports/daily",
    icon: "📈",
    permission: "report:view",
  },
  {
    title: "系统设置",
    href: "/settings/roles",
    icon: "⚙️",
    permission: "settings:view",
    children: [
      { title: "职位权限", href: "/settings/roles", icon: "👥" },
      { title: "员工管理", href: "/settings/users", icon: "👤" },
    ],
  },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  function hasAccess(permission?: string) {
    if (!permission) return true;
    return user.permissions.includes(permission);
  }

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto hidden lg:block">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          if (!hasAccess(item.permission)) return null;

          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.title}</span>
              </Link>

              {item.children && isActive && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        pathname === child.href
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>{child.icon}</span>
                      <span>{child.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
