'use client'
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Role } from '@/types/user';
import "flatpickr/dist/flatpickr.min.css";
import "../../css/animate.css";
import "../../css/style.css";
import "@/css/satoshi.css";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../context/AuthContext";
import DefaultLayout from '@/components/Layouts/DefaultLayout';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }


  return (
      <AuthProvider>
        <html lang="en">
          <body>
            <DefaultLayout>
              {children}
            </DefaultLayout>
          </body>
        </html>
      </AuthProvider>
  )
}
