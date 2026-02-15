import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The Royale Indian - Authentic Indian Cuisine",
  description:
    "Experience the finest authentic Indian cuisine delivered to your doorstep. The Royale Indian offers premium meal delivery with rich flavors, fresh ingredients, and recipes passed down through generations.",
  keywords: [
    "Indian food",
    "Indian cuisine",
    "meal delivery",
    "authentic Indian",
    "The Royale Indian",
    "Indian restaurant",
  ],
  openGraph: {
    title: "The Royale Indian - Authentic Indian Cuisine",
    description:
      "Premium authentic Indian meal delivery. Rich flavors, fresh ingredients, and recipes passed down through generations.",
    siteName: "The Royale Indian",
    type: "website",
    url: "https://theroyaleindian.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FFF8E7] text-[#1a0a00] antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
