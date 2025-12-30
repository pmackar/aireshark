"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/firms", label: "Platforms" },
  { href: "/brands", label: "Brands" },
  { href: "/articles", label: "Articles" },
  { href: "/admin", label: "Admin" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-normal text-[#1d1d1f] hover:opacity-70"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 -mr-2 text-[#1d1d1f]"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-12 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.04] md:hidden">
          <div className="max-w-[980px] mx-auto px-6 py-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-normal text-[#1d1d1f] hover:text-[#14b8a6] transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
