import type { Metadata } from "next";
import "../globals.css";
import Header from "./components/shared/Header";
import { CartProvider } from "./components/context/CartContext";
import Footer from "./components/shared/Footer"; // Import the Footer here

export const metadata: Metadata = {
  title: "Barber Shop",
  description: "Book your barber appointment online",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // --- LAYOUT FIX ---
    // This div will be the flex container
    <div className="flex flex-col min-h-screen">
      <CartProvider>
        <Header />
        {/* The 'flex-grow' class makes the main content area expand */}
        <main className="flex-grow">{children}</main>
        {/* The Footer is now part of the layout, ensuring consistency */}
        <Footer />
      </CartProvider>
    </div>
  );
}
