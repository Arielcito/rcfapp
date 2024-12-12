"use client";

import { useState, useEffect } from 'react';
import UsersTable from '@/components/Users/UsersTable';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

const UsersPage = () => {
  return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Gestión de Usuarios
          </h2>
        </div>
        <UsersTable />
      </div>
  );
};

export default UsersPage; 