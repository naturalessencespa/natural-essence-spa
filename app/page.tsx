"use client";

import { useState } from "react";

import AppointmentsPage from "@/modules/appointments/AppointmentsPage";

import ClientsPage from "@/modules/clients/ClientsPage";

import ServicesPage from "@/modules/services/ServicesPage";

import InventoryPage from "@/modules/inventory/InventoryPage";

import WorkersPage from "@/modules/workers/WorkersPage";

export default function Home() {

  const [page, setPage] =
    useState("reservas");

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-[280px] bg-[#243847] text-white p-6 flex flex-col">

        {/* LOGO */}
        <div className="flex justify-center mb-10">

          <img
            src="/logo.png"
            alt="Natural Essence"
            className="w-[220px] object-contain"
          />

        </div>

        {/* MENU */}
        <div className="flex flex-col gap-3">

          {/* RESERVAS */}
          <button
            onClick={() =>
              setPage("reservas")
            }
            className={`text-left p-4 rounded-2xl transition font-medium ${
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
            className={`text-left p-4 rounded-2xl transition font-medium ${
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
            className={`text-left p-4 rounded-2xl transition font-medium ${
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
            className={`text-left p-4 rounded-2xl transition font-medium ${
              page === "inventario"
                ? "bg-white text-[#243847]"
                : "hover:bg-white/10"
            }`}
          >

            Inventario

          </button>

          {/* TRABAJADORAS */}
          <button
            onClick={() =>
              setPage(
                "trabajadoras"
              )
            }
            className={`text-left p-4 rounded-2xl transition font-medium ${
              page === "trabajadoras"
                ? "bg-white text-[#243847]"
                : "hover:bg-white/10"
            }`}
          >

            Trabajadoras

          </button>

        </div>

      </div>

      {/* CONTENIDO */}
      <div className="flex-1 p-10 overflow-auto">

        {/* RESERVAS */}
        {page === "reservas" && (
          <AppointmentsPage />
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

        {/* TRABAJADORAS */}
        {page === "trabajadoras" && (
          <WorkersPage />
        )}

      </div>

    </div>

  );
}