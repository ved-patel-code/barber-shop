// src/app/manager/_components/ManagerHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Define the navigation items in an array for easy mapping
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
      {/* App Title */}
      <div className="text-lg font-bold">Manager Dashboard</div>

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
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <div className="text-lg font-bold mb-4">Manager Dashboard</div>
              {navItems.map((item) => {
                const fullPath = `/manager/${shopId}/${item.href}`;
                return (
                  <Link
                    key={item.href}
                    href={fullPath}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)} // Close menu on click
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
