import type { Metadata } from "next";

import "./globals.css"
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "Agroriego",
  description: "Calculadora para calcular la lamina de riego",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body cz-shortcut-listen="true">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
