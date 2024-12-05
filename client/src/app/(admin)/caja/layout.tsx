import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reporte de caja | RCF",
  description: "Reporte de caja de RCF",
};

export default function CajaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 