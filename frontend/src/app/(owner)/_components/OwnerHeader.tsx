// src/app/(owner)/_components/OwnerHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Building2 } from "lucide-react"; // Kept the owner's icon

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Owner-specific navigation items
const NAV_ITEMS = [
  { href: "/owner/financials", label: "Financials" },
  { href: "/owner/staff", label: "Staff" },
  { href: "/owner/shops", label: "Shops" },
];

export function OwnerHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Desktop Title/Logo with spacing - styled like ManagerHeader */}
      <Link
        href="/owner/financials"
        className="flex items-center gap-2 text-lg font-bold pr-4" // Added pr-4 for spacing
      >
        <Building2 className="h-6 w-6" />
        <span>Owner Dashboard</span>
      </Link>

      {/* Desktop Navigation - styled like ManagerHeader */}
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

      {/* Mobile Navigation - styled like ManagerHeader */}
      <div className="ml-auto md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-4">
            {" "}
            {/* Added padding to SheetContent */}
            <nav className="grid gap-2 text-base font-medium">
              {" "}
              {/* Adjusted gap and font size */}
              {/* Mobile Logo with specific padding and margin */}
              <div className="flex items-center gap-2 text-lg font-bold mb-4 px-2 py-2">
                <Building2 className="h-6 w-6" />
                <span>Owner Dashboard</span>
              </div>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  // Mobile links styled as larger, padded menu items
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted",
                      isActive
                        ? "bg-muted text-primary" // Active state with background
                        : "text-muted-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
