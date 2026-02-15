"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/track", label: "Track Order" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#1a0a00] shadow-lg shadow-black/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="The Royale Indian"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="hidden sm:inline text-2xl font-heading font-bold text-[#D4A843] tracking-wide group-hover:text-[#e6c56e] transition-colors">
              The Royale Indian
            </span>
            <span className="sm:hidden text-base font-heading font-bold text-[#D4A843] tracking-wide group-hover:text-[#e6c56e] transition-colors">
              Royale Indian
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[#FFF8E7]/80 rounded-md hover:text-[#D4A843] hover:bg-[#D4A843]/10 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin/login"
              className="ml-2 px-2 py-1 text-xs text-[#FFF8E7]/40 hover:text-[#D4A843]/70 transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-md hover:bg-[#D4A843]/10 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span
              className={`block h-0.5 w-6 bg-[#D4A843] transition-all duration-300 ${
                mobileOpen ? "rotate-45 translate-y-[5px]" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-[#D4A843] mt-1.5 transition-all duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-[#D4A843] mt-1.5 transition-all duration-300 ${
                mobileOpen ? "-rotate-45 -translate-y-[5px]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-[#D4A843]/20 bg-[#1a0a00] px-4 pb-4 pt-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-[#FFF8E7]/80 rounded-md hover:text-[#D4A843] hover:bg-[#D4A843]/10 transition-all"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2 text-xs text-[#FFF8E7]/40 hover:text-[#D4A843]/70 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
