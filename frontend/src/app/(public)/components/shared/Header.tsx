// src/app/components/shared/Header.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6 lg:px-12">
        {/* Left side */}
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg">
            BarberShop
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Home
            </Link>
            <Link
              href="/services"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Services
            </Link>
          </nav>
        </div>

        {/* Right side */}
        <div>
          <Link href="/book">
            <Button className="cursor-pointer">Book Appointment</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
