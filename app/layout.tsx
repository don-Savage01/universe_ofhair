"use client";

import { CartProvider } from "./context/CartContext";
import { ProductsProvider } from "./context/ProductsContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import NavigationLoader from "./components/NavigationLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const hideNavbarPages = [
    "/admin",
    "/checkout",
    "/payment-success",
    "/checkout/cancelled",
    "/terms",
    "/privacy",
  ];

  const shouldHideNavbar = hideNavbarPages.some((path) =>
    pathname?.startsWith(path),
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/hairuniverse.png" />
        <link rel="apple-touch-icon" href="/hairuniverse.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Abyssinica+SIL&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Akronim&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alkalami&display=swap"
          rel="stylesheet"
        />
        <title>Universe Of Hair</title>
        <meta name="description" content="Premium hair extensions and wigs" />
      </head>
      <body className="antialiased">
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        <ProductsProvider>
          <CartProvider>
            {!shouldHideNavbar && <Navbar />}
            <main className="pt-0">{children}</main>
          </CartProvider>
        </ProductsProvider>

        <Toaster
          toastOptions={{
            duration: 3000,
            style: {
              background: "#10b981",
              color: "#fff",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
              padding: "12px 20px",
            },
            success: {
              iconTheme: {
                primary: "#fff",
                secondary: "#10b981",
              },
            },
            error: {
              style: {
                background: "#ef4444",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#ef4444",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
