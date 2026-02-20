// app/admin/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Products", href: "/admin/products", icon: "🛍️" },
    { name: "Team Members", href: "/admin/team", icon: "👥" },
  ];

  const handleLogout = async () => {
    try {
      localStorage.removeItem("adminToken");
      await supabase.auth.signOut();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/admin/login";
    }
  };

  return (
    <div className="h-full flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">Hair Universe</h1>
        <p className="text-gray-500 text-sm">Admin Panel</p>
      </div>

      {/* Navigation Menu - this will take available space but not push */}
      <div className="px-4 py-2">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg ${
                isActive
                  ? "bg-pink-100 text-pink-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Spacer that pushes everything below it to the bottom */}
      <div className="flex-grow"></div>

      {/* Logout Button - Now at very bottom of screen */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors group"
        >
          <svg
            className="w-5 h-5 mr-2 text-gray-500 group-hover:text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
