// src/app/(public)/components/shared/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch"; // ✅ shadcn switch
import { pingBackend } from "@/lib/api"; // ✅ your ping function

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About Us" },
  { href: "/timings", label: "Timings" },
];

// ✅ Make interval configurable
const PING_INTERVAL = 60000; // 1 minute (change this value as needed)

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pingEnabled, setPingEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Handle pinging logic
  useEffect(() => {
    if (pingEnabled) {
      // Start interval
      intervalRef.current = setInterval(() => {
        pingBackend();
      }, PING_INTERVAL);
      // Run once immediately too
      pingBackend();
    } else {
      // Clear interval when off
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pingEnabled]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Logo and Desktop Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg mr-4">
            BarberShop
          </Link>
          {/* Desktop Navigation */}
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
            <Link href="/book">
              <Button className="cursor-pointer" size="sm">
                Book Appointment
              </Button>
            </Link>
            {/* ✅ Desktop Switch */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Ping</span>
              <Switch checked={pingEnabled} onCheckedChange={setPingEnabled} />
            </div>
          </nav>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
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
                  <Link href="/book" className="block mt-4">
                    <Button
                      className="cursor-pointer w-full"
                      size="lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Book Appointment
                    </Button>
                  </Link>
                  {/* ✅ Mobile Switch */}
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-muted-foreground">Ping</span>
                    <Switch
                      checked={pingEnabled}
                      onCheckedChange={setPingEnabled}
                    />
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
