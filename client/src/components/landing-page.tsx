"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  Download,
  Calendar,
  Users,
  Clock,
  Shield,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center px-4 lg:px-6">
        <Link className="flex items-center justify-center" href="#">
          <Image
            src="/placeholder.svg?height=40&width=40"
            alt="Logo"
            className="h-10 w-10"
            width={40}
            height={40}
          />
          <span className="sr-only">Reserva tu Cancha</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#"
          >
            Inicio
          </Link>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#"
          >
            Características
          </Link>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#"
          >
            Precios
          </Link>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#"
          >
            Contacto
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#"
          >
            Iniciar sesión
          </Link>
          <Button className="bg-green-500 hover:bg-green-600">
            Registrarse
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center items-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Reserva tu cancha
                  </h1>
                  <h2 className="text-3xl font-bold tracking-tighter text-green-500 sm:text-4xl">
                    De la manera más fácil
                  </h2>
                  <p className="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl">
                    La posibilidad de jugar al deporte más lindo de la manera
                    más simple con tus amigos
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="bg-green-500 hover:bg-green-600">
                    <Download className="mr-2 h-4 w-4" />
                    Descárgala
                  </Button>
                  <Button variant="outline">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Demo
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative flex items-center justify-center md:w-1/2">
                  <Image
                    src="/images/hero/hero-images.png"
                    alt="Captura de pantalla de la aplicación"
                    width={400}
                    height={800}
                    className="relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-gray-100 py-12 md:py-24 lg:py-32 flex justify-center items-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Características principales
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Todo lo que necesitas para gestionar tus reservas deportivas
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-6 w-6 text-green-500" />
                      <h3 className="font-bold">Reservas en tiempo real</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Visualiza la disponibilidad y reserva al instante
                    </p>
                  </li>
                  <li>
                    <div className="flex items-center space-x-3">
                      <Users className="h-6 w-6 text-green-500" />
                      <h3 className="font-bold">Gestión de equipos</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Organiza partidos y coordina con tus amigos
                    </p>
                  </li>
                  <li>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-6 w-6 text-green-500" />
                      <h3 className="font-bold">Recordatorios automáticos</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Nunca te pierdas una reserva con nuestras notificaciones
                    </p>
                  </li>
                  <li>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-6 w-6 text-green-500" />
                      <h3 className="font-bold">Pagos seguros</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Realiza tus pagos de forma segura y transparente
                    </p>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[600px] w-[300px]">
                  <Image
                    alt="Features Preview"
                    className="object-contain"
                    height={600}
                    src="/placeholder.svg?height=600&width=300"
                    width={300}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Comienza ahora
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Descarga la aplicación y empieza a disfrutar del deporte
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button className="bg-green-500 hover:bg-green-600" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Descarga la app
                </Button>
                <Button variant="outline" size="lg">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Ver demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-gray-500">
          © 2024 Reserva tu Cancha. Todos los derechos reservados.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Términos de servicio
          </Link>
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  );
}
