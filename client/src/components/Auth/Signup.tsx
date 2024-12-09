"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const Signup = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.name || !data.email || !data.password || !data.confirmPassword) {
      return toast.error("Por favor completa todos los campos");
    }

    if (data.password !== data.confirmPassword) {
      return toast.error("Las contraseñas no coinciden");
    }

    try {
      toast.loading("Registrando usuario...", { id: "signup" });
      
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      
      toast.success("Usuario registrado exitosamente", { id: "signup" });
      router.push("/onboarding");
    } catch (error) {
      console.error("Error en registro:", error);
      toast.error(error instanceof Error ? error.message : "Error al registrar usuario", { id: "signup" });
    }
  };

  return (
    <section className="pb-[110px] pt-[100px] lg:pt-[200px] flex flex-col items-center justify-center">
      <div className="container overflow-hidden lg:max-w-[1250px]">
        <div className="wow fadeInUp mx-auto w-full max-w-[520px] rounded-lg bg-[#F8FAFB] px-6 py-10 shadow-card dark:bg-[#15182A] dark:shadow-card-dark sm:p-[50px]">
          <div className="mb-9 flex items-center space-x-3 rounded-md border border-stroke bg-white px-[10px] py-2 dark:border-stroke-dark dark:bg-dark">
            <Link
              href="/auth/signin"
              className="block w-full rounded p-2 text-center text-base font-medium text-black hover:bg-primary hover:text-white dark:text-white"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/signup"
              className="block w-full rounded bg-primary p-2 text-center text-base font-medium text-white hover:bg-opacity-90"
            >
              Registrarse
            </Link>
          </div>

          <div className="text-center">
            <h3 className="mb-[10px] text-2xl font-bold text-black dark:text-white sm:text-[28px]">
              Crea tu cuenta
            </h3>
            <p className="mb-11 text-base text-body">
              Es totalmente gratis y muy fácil
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label
                htmlFor="name"
                className="mb-[10px] block text-sm text-black dark:text-white"
              >
                Nombre Completo
              </label>
              <input
                type="text"
                id="name"
                placeholder="Tu nombre completo"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full rounded-md border border-stroke bg-white px-6 py-3 text-base font-medium text-body outline-none focus:border-primary focus:shadow-input dark:border-stroke-dark dark:bg-black dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-[10px] block text-sm text-black dark:text-white"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                placeholder="Tu correo electrónico"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="w-full rounded-md border border-stroke bg-white px-6 py-3 text-base font-medium text-body outline-none focus:border-primary focus:shadow-input dark:border-stroke-dark dark:bg-black dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="mb-5">
              <label
                htmlFor="password"
                className="mb-[10px] block text-sm text-black dark:text-white"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                placeholder="Crea tu contraseña"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                className="w-full rounded-md border border-stroke bg-white px-6 py-3 text-base font-medium text-body outline-none focus:border-primary focus:shadow-input dark:border-stroke-dark dark:bg-black dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="mb-9">
              <label
                htmlFor="confirmPassword"
                className="mb-[10px] block text-sm text-black dark:text-white"
              >
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirma tu contraseña"
                value={data.confirmPassword}
                onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                className="w-full rounded-md border border-stroke bg-white px-6 py-3 text-base font-medium text-body outline-none focus:border-primary focus:shadow-input dark:border-stroke-dark dark:bg-black dark:text-white dark:focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-primary p-3 text-base font-medium text-white hover:bg-opacity-90"
            >
              Crear Cuenta
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Signup;
