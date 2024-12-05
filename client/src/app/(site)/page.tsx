import type { Metadata } from "next";
import HeroArea from "@/components/HeroArea";
import { LandingPage } from "@/components/landing-page";

export const metadata: Metadata = {
  title: "Reserva tu cancha de futbol - RCF",
  description: "Sistema de gestión de reservas para canchas deportivas",
};

export default function Home() {
  return (
    <>
      <LandingPage />
    </>
  );
}
