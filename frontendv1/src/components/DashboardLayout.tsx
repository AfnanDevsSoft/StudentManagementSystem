"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { getRoleName } from "@/types";
import NotificationCenter from "@/components/NotificationCenter";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  title: string;
}

export default function DashboardLayout({
  children,
  sidebarItems,
  title,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  // Auto-expand parent menu items when current path matches a child
  useEffect(() => {
    const newExpandedItems: Record<string, boolean> = {};

    sidebarItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        // Check if any child path matches current pathname
        const hasActiveChild = item.children.some((child) =>
          pathname === child.href || pathname.startsWith(child.href + '/')
        );
        if (hasActiveChild) {
          newExpandedItems[item.label] = true;
        }
      }
    });

    // Only update if there are changes
    if (Object.keys(newExpandedItems).length > 0) {
      setExpandedItems((prev) => ({ ...prev, ...newExpandedItems }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/auth/login");
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (href: string) => pathname === href;

  const SidebarItemComponent = ({
    item,
    level = 0,
  }: {
    item: SidebarItem;
    level?: number;
  }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.label];

    return (
      <div key={item.label}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.label)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span className={level > 0 ? "text-sm" : "font-medium"}>
                {item.label}
              </span>
            </div>
            <span
              className={`transform transition ${isExpanded ? "rotate-180" : ""
                }`}
            >
              ▼
            </span>
          </button>
        ) : (
          <Link href={item.href} className="block">
            <div
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive(item.href)
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              {item.icon}
              <span className={level > 0 ? "text-sm" : "font-medium"}>
                {item.label}
              </span>
            </div>
          </Link>
        )}
        {hasChildren && isExpanded && (
          <div className="ml-4 border-l-2 border-gray-200 pl-2 mt-2 space-y-1">
            {item.children!.map((child) => (
              <SidebarItemComponent
                key={child.label}
                item={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"
          } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          <div
            className={`flex items-center space-x-3 ${!sidebarOpen && "justify-center w-full"
              }`}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">SM</span>
            </div>
            {sidebarOpen && (
              <span className="font-bold text-gray-800">SMS</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {sidebarItems.map((item) => (
            <SidebarItemComponent key={item.label} item={item} />
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t p-4 space-y-2">
          {sidebarOpen && user && (
            <div className="px-2 py-2">
              <p className="text-xs font-semibold text-gray-600 uppercase">
                Logged in as
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {user.first_name}
              </p>
              <p className="text-xs text-gray-600">{getRoleName(user.role)}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition ${!sidebarOpen && "justify-center"
              }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 hover:bg-gray-100 transition border-t w-full flex justify-center"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
              <p className="text-gray-600 text-sm mt-1">
                Welcome back, {user?.first_name}!
              </p>
            </div>
            <NotificationCenter />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
