import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Luxora Perfume Store",
  description: "Premium multilingual perfume storefront with admin panel, customer profile, cart, checkout and FastAPI backend.",
  applicationName: "Luxora",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Navbar />
          {children}
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
