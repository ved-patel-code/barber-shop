// src/app/(owner)/_components/OwnerHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Building2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Define the navigation items in an array for easy mapping and maintenance
const NAV_ITEMS = [
  { href: "/owner/financials", label: "Financials" },
  { href: "/owner/staff", label: "Staff" },
  { href: "/owner/shops", label: "Shops" },
];

export function OwnerHeader() {
  const pathname = usePathname();
  // State to control the mobile menu sheet, allows closing on link click
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* App Title with Icon */}
      <div className="flex items-center gap-2">
        <Building2 className="h-6 w-6" />
        <span className="text-lg font-bold">Owner Dashboard</span>
      </div>

      {/* Desktop Navigation - Aligned to the right */}
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 ml-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Navigation (Hamburger Menu) - Aligned to the right */}
      <div className="ml-auto md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Building2 className="h-6 w-6" />
                <span>Owner Dashboard</span>
              </div>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground"
                  // Close the menu sheet when a link is clicked
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
