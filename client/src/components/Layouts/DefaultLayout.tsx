"use client";
import React, { useState, ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import HeaderAdmin from "../HeaderAdmin";
import { SessionProvider } from "next-auth/react";
import AuthProvider from "@/app/context/AuthContext";
import { Toaster } from "react-hot-toast";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <SessionProvider>
        <AuthProvider>
      {/* <!-- ===== Page Wrapper Star ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Star ===== --> */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Star ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* <!-- ===== Header Star ===== --> */}
          <HeaderAdmin sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Star ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
          {/* <!-- ===== Content Area End ===== --> */}
        </div>
          {/* <!-- ===== Page Wrapper End ===== --> */}
          <Toaster />
        </AuthProvider>
      </SessionProvider>
    </>
  );
}
