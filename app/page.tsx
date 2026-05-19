"use client";

import { useState } from "react";

import Image from "next/image";

import {
  Users,
  Wallet,
  LayoutDashboard,
  Sparkles,
  Package,
} from "lucide-react";

import ServicesPage from "@/modules/services/ServicesPage";

import ClientsPage from "@/modules/clients/ClientsPage";

import AppointmentsPage from "@/modules/appointments/AppointmentsPage";

export default function Home() {

  const [page, setPage] =
    useState("dashboard");

  return (

    <main className="min-h-screen bg-[#243847] flex">

      {/* SIDEBAR */}
      <aside className="w-80 bg-[#1d2d39] p-6 shadow-2xl">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-12">

          <Image
            src="/logo.png"
            alt="Natural Essence"
            width={180}
            height={180}
            className="object-contain"
          />

          <h1 className="text-3xl font-bold text-white mt-4 text-center">

            Natural Essence

          </h1>

          <p className="text-[#8fb7c9] text-sm mt-2">

            Spa y Salón de Masajes

          </p>

        </div>

        {/* MENU */}
        <nav className="space-y-4">

          {/* DASHBOARD */}
          <button
            onClick={() => setPage("dashboard")}
            className="flex items-center gap-3 w-full bg-[#2d4454] hover:bg-[#3da9fc] text-white p-4 rounded-2xl transition"
          >

            <LayoutDashboard size={20} />

            Dashboard

          </button>

          {/* RESERVAS */}
          <button
            onClick={() => setPage("appointments")}
            className="flex items-center gap-3 w-full bg-[#2d4454] hover:bg-[#3da9fc] text-white p-4 rounded-2xl transition"
          >

            📅

            Reservas

          </button>

          {/* CLIENTES */}
          <button
            onClick={() => setPage("clientes")}
            className="flex items-center gap-3 w-full bg-[#2d4454] hover:bg-[#3da9fc] text-white p-4 rounded-2xl transition"
          >

            <Users size={20} />

            Clientes

          </button>

          {/* CAJA */}
          <button
            onClick={() => setPage("caja")}
            className="flex items-center gap-3 w-full bg-[#2d4454] hover:bg-[#3da9fc] text-white p-4 rounded-2xl transition"
          >

            <Wallet size={20} />

            Caja

          </button>

          {/* INVENTARIO */}
          <button
            onClick={() => setPage("inventario")}
            className="flex items-center gap-3 w-full bg-[#2d4454] hover:bg-[#3da9fc] text-white p-4 rounded-2xl transition"
          >

            <Package size={20} />

            Inventario

          </button>

          {/* SERVICIOS */}
          <button
            onClick={() => setPage("servicios")}
            className="flex items-center gap-3 w-full bg-[#2d4454] hover:bg-[#3da9fc] text-white p-4 rounded-2xl transition"
          >

            <Sparkles size={20} />

            Servicios

          </button>

        </nav>

      </aside>

      {/* MAIN */}
      <section className="flex-1 p-10 overflow-y-auto bg-[#f4f7f9]">

        {/* DASHBOARD */}
        {page === "dashboard" && (

          <div>

            <h2 className="text-5xl font-bold text-[#243847] mb-4">

              Dashboard Premium ✨

            </h2>

            <p className="text-gray-600 text-lg mb-10">

              Bienvenida al sistema Natural Essence

            </p>

          </div>

        )}

        {/* SERVICIOS */}
        {page === "servicios" && (
          <ServicesPage />
        )}

        {/* CLIENTES */}
        {page === "clientes" &&
        <ClientsPage />}

        {/* RESERVAS */}
        {page === "appointments" && (
          <AppointmentsPage />
        )}

      </section>

    </main>
  );
}