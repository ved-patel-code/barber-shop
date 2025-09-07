// src/app/components/shared/Header.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Using the shadcn alias

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">BarberShop</span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
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
            {/* We will add a Shops link later if needed */}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Link href="/book">
            <Button>Book Appointment</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
