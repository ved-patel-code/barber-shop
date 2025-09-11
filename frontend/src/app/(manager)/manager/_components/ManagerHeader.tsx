// src/app/(manager)/manager/_components/ManagerHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "active-appointments", label: "Active Appointments" },
  { href: "appointments", label: "Appointments" },
  { href: "staff", label: "Staff" },
  { href: "scheduled-staff", label: "Scheduled Staff" },
  { href: "financials", label: "Financials" },
];

interface ManagerHeaderProps {
  shopId: string;
}

export function ManagerHeader({ shopId }: ManagerHeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* --- FIX 1: Added padding to the logo/title --- */}
      {/* pr-4 adds space between the title and the nav links on desktop */}
      <div className="text-lg font-bold pr-4">Manager Dashboard</div>

      {/* Desktop Navigation */}
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 ml-auto">
        {navItems.map((item) => {
          const fullPath = `/manager/${shopId}/${item.href}`;
          const isActive = pathname === fullPath;
          return (
            <Link
              key={item.href}
              href={fullPath}
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

      {/* Mobile Navigation */}
      <div className="ml-auto md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          {/* --- FIX 2: Added padding to the SheetContent for overall spacing --- */}
          <SheetContent side="left" className="p-4">
            <nav className="grid gap-2 text-base font-medium">
              {/* --- FIX 3: Added padding and margin to the mobile logo --- */}
              <div className="text-lg font-bold mb-4 px-2 py-2">
                Manager Dashboard
              </div>
              {navItems.map((item) => {
                const fullPath = `/manager/${shopId}/${item.href}`;
                const isActive = pathname === fullPath;
                return (
                  // --- FIX 4: Transformed links into larger, padded menu items ---
                  <Link
                    key={item.href}
                    href={fullPath}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted",
                      isActive
                        ? "bg-muted text-primary"
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
