"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import validateEmail from "@/app/libs/validate";

const Signin = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const loginUser = async (e: any) => {
    e.preventDefault();

    signIn("credentials", { ...data, redirect: false }).then((callback) => {
      if (callback?.error) {
        toast.error(callback.error);
      }

      if (callback?.ok && !callback?.error) {
        toast.success("Sesión iniciada exitosamente");
        setData({ email: "", password: "", remember: false });
        window.location.href = "/dashboard";
      }
    });
  };

  return (
    <>
      {/* <!-- ===== SignIn Form Start ===== --> */}
      <section className="pb-[110px] pt-[100px] lg:pt-[200px] flex flex-col items-center justify-center">
        <div className="container overflow-hidden lg:max-w-[1250px]">
          <div
            className="wow fadeInUp mx-auto w-full max-w-[520px] rounded-lg bg-[#F8FAFB] px-6 py-10 shadow-card dark:bg-[#15182A] dark:shadow-card-dark sm:p-[50px]"
            data-wow-delay=".2s"
          >
            <div className="mb-9 flex items-center space-x-3 rounded-md border border-stroke bg-white px-[10px] py-2 dark:border-stroke-dark dark:bg-dark">
              <Link
                href="\auth\signin"
                className="block w-full rounded bg-primary p-2 text-center text-base font-medium text-white hover:bg-opacity-90"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="\auth\signup"
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

              <button
                aria-label="iniciar sesión con google"
                onClick={() => signIn("google")}
                className="mb-6 flex w-full items-center justify-center rounded-md border border-stroke bg-white p-3 text-base font-medium text-body hover:text-primary dark:border-stroke-dark dark:bg-dark"
              >
                Iniciar sesión con Google
              </button>

              <div className="relative z-10 mb-[30px] flex items-center">
                <span className="hidden h-[1px] w-full max-w-[70px] bg-stroke dark:bg-stroke-dark sm:block"></span>
                <p className="w-full px-5 text-base text-body">
                  O inicia sesión con tu correo
                </p>
                <span className="hidden h-[1px] w-full max-w-[70px] bg-stroke dark:bg-stroke-dark sm:block"></span>
              </div>
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
                  placeholder="Ingresa tu correo"
                  name="email"
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
                  placeholder="Ingresa tu contraseña"
                  name="password"
                  value={data.password}
                  onChange={(e) =>
                    setData({ ...data, password: e.target.value })
                  }
                  className="w-full rounded-md border border-stroke bg-white px-6 py-3 text-base font-medium text-body outline-none focus:border-primary focus:shadow-input dark:border-stroke-dark dark:bg-black dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="-mx-2 mb-[30px] flex flex-wrap justify-between">
                <div className="w-full px-2 sm:w-1/2">
                  <label
                    htmlFor="keep-signed"
                    className="mb-4 flex cursor-pointer select-none items-center text-base text-body sm:mb-0"
                  >
                    <input
                      type="checkbox"
                      name="keep-signed"
                      id="keep-signed"
                      className="keep-signed sr-only"
                      onChange={(e) =>
                        setData({ ...data, remember: e.target.checked })
                      }
                    />
                    <span
                      className={`box mr-[10px] flex h-[22px] w-[22px] items-center justify-center rounded-sm border-[.7px] border-stroke bg-white dark:border-stroke-dark dark:bg-black ${
                        data?.remember && "bg-primary"
                      }`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon hidden"
                      >
                        <g clipPath="url(#clip0_73_381)">
                          <path
                            d="M6.66649 10.1148L12.7945 3.98608L13.7378 4.92875L6.66649 12.0001L2.42383 7.75742L3.36649 6.81475L6.66649 10.1148Z"
                            fill="white"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_73_381">
                            <rect width="16" height="16" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                    <span>Mantener sesión iniciada</span>
                  </label>
                </div>

                <div className="w-full px-2 sm:w-1/2">
                  <Link
                    href="/auth/forget-password"
                    aria-label="contraseña olvidada"
                    className="text-base text-primary hover:underline sm:text-right"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                aria-label="iniciar sesión con correo y contraseña"
                className="flex w-full justify-center rounded-md bg-primary p-3 text-base font-medium text-white hover:bg-opacity-90"
              >
                Iniciar Sesión
              </button>
            </form>
          </div>
        </div>
      </section>
      {/* <!-- ===== SignIn Form End ===== --> */}
    </>
  );
};

export default Signin;
