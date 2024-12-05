"use client";

import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CajaTable from "@/components/Tables/CajaTable";
import { usePredio } from "@/hooks/usePredio";

const CajaPage = () => {

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Reporte de caja" />

      <div className="flex flex-col gap-10">
        <CajaTable  />
      </div>
    </DefaultLayout>
  );
};

export default CajaPage; 