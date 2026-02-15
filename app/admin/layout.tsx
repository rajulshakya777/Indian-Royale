"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "\u{1F4CA}" },
  { href: "/admin/menu", label: "Menu Management", icon: "\u{1F372}" },
  { href: "/admin/content", label: "Content Management", icon: "\u{1F4DD}" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "\u{1F4E6}" },
  { href: "/admin/orders", label: "Orders", icon: "\u{1F4CB}" },
  { href: "/admin/cancellations", label: "Cancellations", icon: "\u274C" },
  { href: "/admin/sales", label: "Sales", icon: "\u{1F4B0}" },
  { href: "/admin/analytics", label: "Analytics", icon: "\u{1F4C8}" },
  { href: "/admin/export", label: "Export Data", icon: "\u{1F4E5}" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthenticated(true);
      return;
    }
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
    } else {
      setAuthenticated(true);
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0a00]">
        <div className="text-[#D4A843] text-lg">Loading...</div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-[#1a0a00]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1a0a00] border-r border-[#D4A843]/20 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-[#D4A843]/20">
          <h1 className="text-xl font-bold text-[#D4A843]">Royale Indian</h1>
          <p className="text-[#FFF8E7]/50 text-xs mt-1">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#D4A843]/20 text-[#D4A843] border border-[#D4A843]/30"
                    : "text-[#FFF8E7]/70 hover:bg-[#D4A843]/10 hover:text-[#D4A843]"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#D4A843]/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <span className="text-lg">{"\u{1F6AA}"}</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar for mobile */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-[#D4A843]/20 bg-[#1a0a00]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#D4A843] text-2xl"
          >
            {"\u2630"}
          </button>
          <h1 className="text-[#D4A843] font-bold">Royale Indian Admin</h1>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
