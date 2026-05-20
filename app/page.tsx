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
      <div className="w-[280px] bg-[#243847] text-white p-6">

        <h1 className="text-3xl font-bold mb-10">

          Natural Essence

        </h1>

        <div className="flex flex-col gap-3">

          {/* RESERVAS */}
          <button
            onClick={() =>
              setPage("reservas")
            }
            className={`text-left p-4 rounded-2xl transition ${
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
            className={`text-left p-4 rounded-2xl transition ${
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
            className={`text-left p-4 rounded-2xl transition ${
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
            className={`text-left p-4 rounded-2xl transition ${
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
            className={`text-left p-4 rounded-2xl transition ${
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
      <div className="flex-1 p-10">

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