import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "شركة جوهرة السلمان العقارية | Jawhart Al-Salman Real Estate",
  description: "نظام إدارة شركة جوهرة السلمان العقارية - إدارة المستأجرين والشقق والعقود والدفعات",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "جوهرة السلمان",
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
