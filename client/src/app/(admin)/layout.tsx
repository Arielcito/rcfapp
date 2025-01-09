'use client'
import { useRequireAuth } from '@/hooks/useRequireAuth';
import "flatpickr/dist/flatpickr.min.css";
import "../../css/animate.css";
import "../../css/style.css";
import "@/css/satoshi.css";
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
    <DefaultLayout>
      {children}
    </DefaultLayout>
  )
}
