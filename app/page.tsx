"use client";

import { useState } from "react";

import AppointmentsPage from "@/modules/appointments/AppointmentsPage";

import ClientsPage from "@/modules/clients/ClientsPage";

import ServicesPage from "@/modules/services/ServicesPage";

import InventoryPage from "@/modules/inventory/InventoryPage";

import WorkersPage from "@/modules/workers/WorkersPage";

import PackagesPage from "@/modules/packages/PackagesPage";

import InternalSalesPage from "@/modules/internal-sales/InternalSalesPage";

import ProductSalesPage from "@/modules/product-sales/ProductSalesPage";

import InventoryMovementsPage from "@/modules/inventory-movements/InventoryMovementsPage";

import DashboardPage from "@/modules/dashboard/DashboardPage";

import LaserZonesPage from "@/modules/laser-zones/LaserZonesPage";

import LaserQuotePage from "@/modules/laser-quote/LaserQuotePage";

import ExpensesPage from "@/modules/expenses/ExpensesPage";

import PendingServicesPage from "@/modules/pending-services/PendingServicesPage";

export default function Home() {

const [page, setPage] =
  useState("dashboard");

const [
  pendingLaserSale,
  setPendingLaserSale
] = useState<any>(null);

  return (

    <div className="flex min-h-screen bg-gray-100 overflow-hidden">

      {/* SIDEBAR */}
      <div className="w-64 xl:w-72 bg-[#243847] text-white p-4 md:p-6 flex flex-col flex-shrink-0 overflow-y-auto">

        {/* LOGO */}
        <div className="flex justify-center mb-10">

          <img
            src="/logo.png"
            alt="Natural Essence"
            className="w-40 md:w-48 xl:w-56 object-contain"
          />

        </div>

        {/* MENU */}
        <div className="flex flex-col gap-3">

          <button
  onClick={() =>
    setPage("dashboard")
  }
  className={`text-left px-4 py-3 rounded-2xl transition font-medium ${
    page === "dashboard"
      ? "bg-white text-[#243847]"
      : "hover:bg-white/10"
  }`}
>

  Dashboard

</button>

          {/* RESERVAS */}
          <button
            onClick={() =>
              setPage("reservas")
            }
            className={`text-left px-4 py-3 rounded-2xl transition font-medium ${
              page === "reservas"
                ? "bg-white text-[#243847]"
                : "hover:bg-white/10"
            }`}
          >

            Reservas

          </button>

          {/* CLIENTES */}
          <button
            onClick={() =>
              setPage("clientes")
            }
            className={`text-left px-4 py-3 rounded-2xl transition font-medium ${
              page === "clientes"
                ? "bg-white text-[#243847]"
                : "hover:bg-white/10"
            }`}
          >

            Clientes

          </button>

          {/* SERVICIOS */}
          <button
            onClick={() =>
              setPage("servicios")
            }
            className={`text-left px-4 py-3 rounded-2xl transition font-medium ${
              page === "servicios"
                ? "bg-white text-[#243847]"
                : "hover:bg-white/10"
            }`}
          >

            Servicios

          </button>

        

          {/* INVENTARIO */}
          <button
            onClick={() =>
              setPage("inventario")
            }
            className={`text-left px-4 py-3 rounded-2xl transition font-medium ${
              page === "inventario"
                ? "bg-white text-[#243847]"
                : "hover:bg-white/10"
            }`}
          >

            Inventario

          </button>

            <button
  onClick={() =>
    setPage(
      "movimientos-inventario"
    )
  }
  className={`text-left px-4 py-3 rounded-2xl transition ${
    page ===
    "movimientos-inventario"
      ? "bg-white text-[#243847]"
      : "hover:bg-white/10"
  }`}
>

  Movimientos Inventario

</button>

          {/* TRABAJADORAS */}
          <button
            onClick={() =>
              setPage(
                "trabajadoras"
              )
            }
            className={`text-left px-4 py-3 rounded-2xl transition font-medium ${
              page === "trabajadoras"
                ? "bg-white text-[#243847]"
                : "hover:bg-white/10"
            }`}
          >

            Trabajadoras

          </button>

          <button
            onClick={() =>
              setPage("paquetes")
            }
            className={`text-left px-4 py-3 rounded-2xl transition ${
              page === "paquetes"
                ? "bg-white text-[#243847]"
                : "hover:bg-white/10"
            }`}
          >

            Paquetes

         </button>

         <button
  onClick={() =>
    setPage("zonas-laser")
  }
  className={`text-left px-4 py-3 rounded-2xl transition font-medium ${
    page === "zonas-laser"
      ? "bg-white text-[#243847]"
      : "hover:bg-white/10"
  }`}
>

  Zonas Láser

</button>

<button
  onClick={() =>
    setPage("calculadora-laser")
  }
  className={`text-left px-4 py-3 rounded-2xl transition font-medium ${
    page === "calculadora-laser"
      ? "bg-white text-[#243847]"
      : "hover:bg-white/10"
  }`}
>

  Calculadora Láser

</button>

         <button
  onClick={() =>
    setPage(
      "ventas-internas"
    )
  }
  className={`text-left px-4 py-3 rounded-2xl transition ${
    page ===
    "ventas-internas"
      ? "bg-white text-[#243847]"
      : "hover:bg-white/10"
  }`}
>

  Ventas Internas

</button>

<button
  onClick={() =>
    setPage(
      "ventas-productos"
    )
  }
  className={`text-left px-4 py-3 rounded-2xl transition ${
    page ===
    "ventas-productos"
      ? "bg-white text-[#243847]"
      : "hover:bg-white/10"
  }`}
>

  Ventas Productos

</button>

<button
  onClick={() =>
    setPage("servicios-pendientes")
  }
  className={`text-left px-4 py-3 rounded-2xl transition ${
    page === "servicios-pendientes"
      ? "bg-white text-[#243847]"
      : "hover:bg-white/10"
  }`}
>

  Servicios Pendientes

</button>

<button
  onClick={() =>
    setPage("gastos")
  }
  className={`text-left px-4 py-3 rounded-2xl transition ${
    page === "gastos"
      ? "bg-white text-[#243847]"
      : "hover:bg-white/10"
  }`}
>

  Gastos

</button>

        </div>

      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-auto p-4 md:p-6 xl:p-10 min-w-0">

        {/* RESERVAS */}
        {page === "reservas" && (
          <AppointmentsPage
  setPage={setPage}
  setPendingLaserSale={
    setPendingLaserSale
  }
/>
        )}

        {page === "dashboard" && (
          <DashboardPage />
        )}

        {/* CLIENTES */}
        {page === "clientes" && (
          <ClientsPage />
        )}

        {/* SERVICIOS */}
        {page === "servicios" && (
          <ServicesPage />
        )}

        {/* INVENTARIO */}
        {page === "inventario" && (
          <InventoryPage />
        )}

         {/* MOVIMIENTOS INVENTARIO */}

        {page ===
          "movimientos-inventario" && (
          <InventoryMovementsPage />
        )}

        {/* TRABAJADORAS */}
        {page === "trabajadoras" && (
          <WorkersPage />
        )}

         {/* PAQUETES */}
        {page === "paquetes" && (
          <PackagesPage
  pendingLaserSale={
    pendingLaserSale
  }
  setPendingLaserSale={
    setPendingLaserSale
  }
/>
        )}

        {/* ZONA LÁSER */}
        {page === "zonas-laser" && (
          <LaserZonesPage />
        )}

        {page === "calculadora-laser" && (
          <LaserQuotePage />
        )}

       {/* VENTAS INTERNAS */}
        {page ===
          "ventas-internas" && (
          <InternalSalesPage />
        )}

        {/* VENTAS PRODUCTOS */}
        {page ===
          "ventas-productos" && (
          <ProductSalesPage />
        )}

        {page ===
          "servicios-pendientes" && (
          <PendingServicesPage />
        )}

        {page === "gastos" && (
          <ExpensesPage />
        )}

      </div>

    </div>

  );
}