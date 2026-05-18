import type { Metadata } from "next";
import "./globals.css";
import { DashboardProvider } from "./_components/DashboardProvider";
import Sidebar from "./_components/Sidebar";
import MobileNav from "./_components/MobileNav";
import DashboardShell from "./_components/DashboardShell";

export const metadata: Metadata = {
  title: "Finanku - Agency Dashboard",
  description: "Agency Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body-md text-body-md antialiased overflow-x-hidden flex selection:bg-primary-container selection:text-on-primary-container">
        <DashboardProvider>
          <Sidebar />
          <MobileNav />
          <DashboardShell>{children}</DashboardShell>
        </DashboardProvider>
      </body>
    </html>
  );
}

