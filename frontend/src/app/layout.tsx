// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

// This metadata can be general, as it will be overridden by more
// specific metadata in the child layouts if needed.
export const metadata: Metadata = {
  title: "Barber Shop",
  description: "Your one-stop shop for premium grooming.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/*
          This layout is now clean. It does NOT include the <Header> or <CartProvider>.
          Those have been moved to the (public) layout, so they will only apply
          to the public-facing pages. The children will be either the public
          layout's content or the manager layout's content.
        */}
        {children}
      </body>
    </html>
  );
}
