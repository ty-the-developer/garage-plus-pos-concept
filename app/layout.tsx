import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  openGraph: {
    title: "Garage Plus POS",
    description: 'The Garage Plus POS system is a custom point-of-sale platform that streamlines sales, inventory, and reporting for both the garage and parts warehouse in one modern interface.',
    url: 'https://mtlspinclub.com',
    siteName: 'Garage Plus POS',
    images: [
      {
        // url: "https://mtlspinclub.com/squadPic.jpeg", // Must be an absolute URL
        url: "https://garage-plus-pos-concept.vercel.app/Garage%20Plus%20Logo%20Icons.png",
        width: 800,
        height: 600,
      },
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
