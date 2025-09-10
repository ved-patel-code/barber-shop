import type { Metadata } from "next";
import "../globals.css";
import Header from "./components/shared/Header";
import { CartProvider } from "./components/context/CartContext";

export const metadata: Metadata = {
  title: "Barber Shop",
  description: "Book your barber appointment online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
