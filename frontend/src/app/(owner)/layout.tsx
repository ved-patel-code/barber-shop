import { OwnerHeader } from "./_components/OwnerHeader";
import { Toaster } from "sonner"; // <-- import Toaster

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <OwnerHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-8 md:p-8">
        {children}
      </main>

      {/* Add Toaster here so toast messages will appear */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
