import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "إدارة عمارة زمزم | Zamzam Building Management",
  description: "نظام إدارة عمارة زمزم - إدارة المستأجرين والشقق والعقود والدفعات",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "عمارة زمزم",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e3a5f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
