"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const Signin = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const router = useRouter();
  const { login } = useAuth();

  const loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.email || !data.password) {
      return toast.error("Por favor completa todos los campos");
    }

    try {
      toast.loading("Iniciando sesión...", { id: "login" });
      
      await login(data.email, data.password);
      
      toast.success("Sesión iniciada exitosamente", { id: "login" });
      setData({ email: "", password: "", remember: false });
      
      router.push("/onboarding");
    } catch (error) {
      console.error("Error en inicio de sesión:", error);
      toast.error(error instanceof Error ? error.message : "Error al iniciar sesión", { id: "login" });
    }
  };

  return (
    <section className="pb-[110px] pt-[100px] lg:pt-[200px] flex flex-col items-center justify-center">
      <div className="container overflow-hidden lg:max-w-[1250px]">
        <div className="wow fadeInUp mx-auto w-full max-w-[520px] rounded-lg bg-[#F8FAFB] px-6 py-10 shadow-card dark:bg-[#15182A] dark:shadow-card-dark sm:p-[50px]">
          <div className="mb-9 flex items-center space-x-3 rounded-md border border-stroke bg-white px-[10px] py-2 dark:border-stroke-dark dark:bg-dark">
            <Link
              href="/auth/signin"
              className="block w-full rounded bg-primary p-2 text-center text-base font-medium text-white hover:bg-opacity-90"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/signup"
              className="block w-full rounded p-2 text-center text-base font-medium text-black hover:bg-primary hover:text-white dark:text-white"
            >
              Registrarse
            </Link>
          </div>

          <div className="text-center">
            <h3 className="mb-[10px] text-2xl font-bold text-black dark:text-white sm:text-[28px]">
              Inicia sesión en tu cuenta
            </h3>
            <p className="mb-11 text-base text-body">
              Accede a tu cuenta para un proceso de compra más rápido.
            </p>
          </div>

          <form onSubmit={loginUser}>
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-[10px] block text-sm text-black dark:text-white"
              >
                Tu Correo
              </label>
              <input
                type="email"
                id="email"
                placeholder="Ingresa tu correo"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="w-full rounded-md border border-stroke bg-white px-6 py-3 text-base font-medium text-body outline-none focus:border-primary focus:shadow-input dark:border-stroke-dark dark:bg-black dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="mb-[10px] block text-sm text-black dark:text-white"
              >
                Tu contraseña
              </label>
              <input
                type="password"
                id="password"
                placeholder="Ingresa tu contraseña"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                className="w-full rounded-md border border-stroke bg-white px-6 py-3 text-base font-medium text-body outline-none focus:border-primary focus:shadow-input dark:border-stroke-dark dark:bg-black dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="-mx-2 mb-[30px] flex flex-wrap justify-between">
              <div className="w-full px-2 sm:w-1/2">
                <label
                  htmlFor="remember"
                  className="flex cursor-pointer select-none items-center text-sm text-body"
                >
                  <input
                    type="checkbox"
                    id="remember"
                    checked={data.remember}
                    onChange={(e) => setData({ ...data, remember: e.target.checked })}
                    className="mr-3"
                  />
                  Mantener sesión iniciada
                </label>
              </div>
              <div className="w-full px-2 sm:w-1/2 text-right">
                <Link
                  href="/auth/forget-password"
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-primary p-3 text-base font-medium text-white hover:bg-opacity-90"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Signin;
