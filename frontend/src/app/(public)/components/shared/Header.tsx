// src/app/(public)/components/shared/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
];

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Logo and Desktop Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg mr-4">
            BarberShop
          </Link>
          {/* Desktop Navigation: Hidden on small screens, visible on medium and up */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
            {/* --- MOVED "Book Appointment" BUTTON FOR DESKTOP --- */}
            <Link href="/book">
              <Button className="cursor-pointer" size="sm">
                {" "}
                {/* Use sm size for nav bar */}
                Book Appointment
              </Button>
            </Link>
          </nav>
        </div>

        {/* Right Side: ONLY Mobile Menu (Hamburger) now */}
        {/* The "Book Appointment" button for mobile will be inside the Sheet */}
        <div className="flex items-center gap-2 md:hidden">
          {" "}
          {/* Hide this div on desktop */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col space-y-8 p-6">
                <Link href="/" className="font-bold text-xl mb-4">
                  BarberShop
                </Link>
                <nav className="grid gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-lg font-medium text-muted-foreground hover:text-foreground py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {/* --- "Book Appointment" BUTTON FOR MOBILE (inside Sheet) --- */}
                  <Link href="/book" className="block mt-4">
                    {" "}
                    {/* Added block and margin-top */}
                    <Button
                      className="cursor-pointer w-full"
                      size="lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Book Appointment
                    </Button>
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
