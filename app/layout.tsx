import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "./_components/DashboardProvider";
import Sidebar from "./_components/Sidebar";
import MobileNav from "./_components/MobileNav";
import DashboardShell from "./_components/DashboardShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ashas Dashboard",
  description: "Personal workspace untuk agency web development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-off-white text-navy-dark antialiased">
        <DashboardProvider>
          <Sidebar />
          <MobileNav />
          <DashboardShell>{children}</DashboardShell>
        </DashboardProvider>
      </body>
    </html>
  );
}
