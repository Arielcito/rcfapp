'use client'
import "flatpickr/dist/flatpickr.min.css";
import "../../css/animate.css";
import "../../css/style.css";
import "@/css/satoshi.css";
import { SessionProvider } from "next-auth/react";
import AuthProvider from "../context/AuthContext";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AuthProvider>
        <html lang="en">
          <body>{children}</body>
        </html>
      </AuthProvider>
    </SessionProvider>
  )
}
