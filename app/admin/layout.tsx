"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import { supabase } from "@/lib/supabase"; // ← ADD THIS IMPORT

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Hide pink hamburger
    const pinkTimer = setInterval(() => {
      document.querySelectorAll("*").forEach((el) => {
        const bgColor = window.getComputedStyle(el).backgroundColor;
        if (bgColor === "rgb(255, 66, 179)" || bgColor === "#ff42b3") {
          el.style.display = "none";
        }
      });
    }, 500);

    // NEW: Force hide any frontend navbar
    const hideFrontendNavbar = () => {
      // Target the frontend navbar specifically
      const frontendNavbar = document.querySelector("nav:first-of-type");
      if (
        frontendNavbar &&
        !frontendNavbar.classList.contains("admin-sidebar")
      ) {
        frontendNavbar.style.display = "none";
        frontendNavbar.style.visibility = "hidden";
        frontendNavbar.style.height = "0";
        frontendNavbar.style.margin = "0";
        frontendNavbar.style.padding = "0";
        frontendNavbar.style.overflow = "hidden";
        frontendNavbar.style.position = "absolute";
        frontendNavbar.style.zIndex = "-9999";
      }

      // Also check for any header that contains nav
      const headers = document.querySelectorAll("header");
      headers.forEach((header) => {
        if (!header.classList.contains("admin-header")) {
          const navInside = header.querySelector("nav");
          if (navInside) {
            header.style.display = "none";
            header.style.height = "0";
            header.style.margin = "0";
            header.style.padding = "0";
            header.style.visibility = "hidden";
            header.style.overflow = "hidden";
            header.style.position = "absolute";
            header.style.zIndex = "-9999";
          }
        }
      });

      // Remove any top padding/margin from body/main that navbar might have caused
      document.body.style.paddingTop = "0";
      document.body.style.marginTop = "0";
      const mainElement = document.querySelector("main");
      if (mainElement) {
        mainElement.style.paddingTop = "0";
        mainElement.style.marginTop = "0";
      }
    };

    // Run navbar hiding immediately and on interval
    hideFrontendNavbar();
    const navbarTimer = setInterval(hideFrontendNavbar, 100);

    const checkAuth = async () => {
      // Check REAL Supabase auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admin/login");
      } else {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();

    return () => {
      clearInterval(pinkTimer);
      clearInterval(navbarTimer);
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex admin-layout">
      {/* Desktop Sidebar */}
      <div
        className={`lg:block w-64 min-h-screen bg-white border-r border-gray-200 fixed lg:static z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <AdminSidebar />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content - FULL WIDTH */}
      <div className="flex-1 flex flex-col lg:ml-0 w-full overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center lg:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors lg:flex items-center gap-2"
          >
            <span className="text-lg">☰</span>
            <span className="hidden lg:inline text-sm font-medium">Menu</span>
          </button>

          <h1 className="text-lg lg:text-xl font-semibold text-gray-800">
            <span className="lg:hidden">Admin</span>
            <span className="hidden lg:inline">Admin Dashboard</span>
          </h1>

          <div className="hidden lg:block">
            <AdminHeader />
          </div>

          <div className="lg:hidden w-10"></div>
        </div>

        {/* Mobile Header Actions */}
        <div className="lg:hidden px-4 py-2 bg-white border-b border-gray-100">
          <AdminHeader />
        </div>

        {/* Page Content - REMOVED max-w-full, added full width classes */}
        <main className="flex-1 p-3 md:p-4 lg:p-6 w-full overflow-x-auto">
          <div className="w-full min-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
