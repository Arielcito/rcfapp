'use client'
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Role } from '@/types/user';
import "flatpickr/dist/flatpickr.min.css";
import "../../css/animate.css";
import "../../css/style.css";
import "@/css/satoshi.css";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../context/AuthContext";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }


  return (
      <AuthProvider>
        <html lang="en">
          <body>{children}</body>
        </html>
      </AuthProvider>
  )
}
