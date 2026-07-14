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

  const [selectedBranch, setSelectedBranch] = useState(1);

  const [sidebarOpen, setSidebarOpen] = useState(false);

const [
  pendingLaserSale,
  setPendingLaserSale
] = useState<any>(null);

  return (

   <div className="relative flex min-h-screen bg-gray-100">

    {/* BOTÓN MÓVIL */}

<button

  onClick={() =>

    setSidebarOpen(true)

  }

 className={`

md:hidden
fixed
top-4
left-4
z-50
bg-[#243847]
text-white
p-3
rounded-xl
shadow-lg

${sidebarOpen ? "hidden" : ""}

`}

>

☰

</button>

      {/* SIDEBAR */}
      <div

className={`

fixed md:static

top-0 left-0

h-screen overflow-y-auto

w-72

bg-[#243847]

text-white

p-6

flex

flex-col

transition-transform

duration-300

z-50

${

sidebarOpen

? "translate-x-0"

: "-translate-x-full"

}

md:translate-x-0

`}

>
  



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
  onClick={() => {
    setPage("dashboard");
      setSidebarOpen(false);
  }}
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
            onClick={() =>{
              setPage("reservas");
              setSidebarOpen(false);
              
            }}
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
            onClick={() =>{
              setPage("clientes");
              setSidebarOpen(false);
            }}
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
            onClick={() =>{
              setPage("servicios");
              setSidebarOpen(false);
            }}
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
            onClick={() =>{
              setPage("inventario");
              setSidebarOpen(false);
            }}
            className={`text-left px-4 py-3 rounded-2xl transition font-medium ${
              page === "inventario"
                ? "bg-white text-[#243847]"
                : "hover:bg-white/10"
            }`}
          >

            Inventario

          </button>

            <button
  onClick={() =>{
    setPage(
      "movimientos-inventario"
    );
    setSidebarOpen(false);
  }}
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
            onClick={() =>{
              setPage(
                "trabajadoras"
              );
              setSidebarOpen(false);
            }}
            className={`text-left px-4 py-3 rounded-2xl transition font-medium ${
              page === "trabajadoras"
                ? "bg-white text-[#243847]"
                : "hover:bg-white/10"
            }`}
          >

            Trabajadoras

          </button>

          <button
            onClick={() =>{
              setPage("paquetes");
              setSidebarOpen(false);
            }}
            className={`text-left px-4 py-3 rounded-2xl transition ${
              page === "paquetes"
                ? "bg-white text-[#243847]"
                : "hover:bg-white/10"
            }`}
          >

            Paquetes

         </button>

         <button
  onClick={() =>{
    setPage("zonas-laser");
    setSidebarOpen(false);
  }}
  className={`text-left px-4 py-3 rounded-2xl transition font-medium ${
    page === "zonas-laser"
      ? "bg-white text-[#243847]"
      : "hover:bg-white/10"
  }`}
>

  Zonas Láser

</button>

<button
  onClick={() =>{
    setPage("calculadora-laser");
    setSidebarOpen(false);
  }}
  className={`text-left px-4 py-3 rounded-2xl transition font-medium ${
    page === "calculadora-laser"
      ? "bg-white text-[#243847]"
      : "hover:bg-white/10"
  }`}
>

  Calculadora Láser

</button>

         <button
  onClick={() =>{
    setPage(
      "ventas-internas"
    );
    setSidebarOpen(false);
  }}
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
  onClick={() =>{
    setPage(
      "ventas-productos"
    );
    setSidebarOpen(false);
  }}
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
  onClick={() =>{
    setPage("servicios-pendientes");
    setSidebarOpen(false);
  }}
  className={`text-left px-4 py-3 rounded-2xl transition ${
    page === "servicios-pendientes"
      ? "bg-white text-[#243847]"
      : "hover:bg-white/10"
  }`}
>

  Servicios Pendientes

</button>

<button
  onClick={() =>{
    setPage("gastos");
    setSidebarOpen(false);
  }}
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

        {sidebarOpen && (

<div

onClick={()=>

setSidebarOpen(false)

}

className="fixed inset-0 bg-black/40 z-40 md:hidden"

/>

)}

      {/* CONTENIDO */}
      <div className="flex-1 overflow-auto p-4 md:p-6 xl:p-10">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

  <h1 className="text-2xl md:text-3xl font-bold text-[#243847]">
    Natural Essence Spa
  </h1>

  <select
    value={selectedBranch}
    onChange={(e) =>
      setSelectedBranch(Number(e.target.value))
    }
    className="w-full md:w-64 border rounded-2xl px-4 py-3 bg-white shadow"
  >
    <option value={1}>📍 Los Olivos</option>
    <option value={2}>📍 San Borja</option>
  </select>

</div>

    

        {/* RESERVAS */}
        {page === "reservas" && (
          <AppointmentsPage
  selectedBranch={selectedBranch}
  setPage={setPage}
  setPendingLaserSale={setPendingLaserSale}
/>
        )}

        {page === "dashboard" && (
          <DashboardPage
          selectedBranch={selectedBranch}
/>
        )}

        {/* CLIENTES */}
        {page === "clientes" && (
          <ClientsPage
  selectedBranch={selectedBranch}
/>
        )}

        {/* SERVICIOS */}
    {page === "servicios" && (
  <ServicesPage />
)}
        {/* INVENTARIO */}
        {page === "inventario" && (
        <InventoryPage
  selectedBranch={selectedBranch}
/>
        )}

         {/* MOVIMIENTOS INVENTARIO */}

        {page ===
          "movimientos-inventario" && (
          <InventoryMovementsPage
  selectedBranch={selectedBranch}
/>
        )}

        {/* TRABAJADORAS */}
        {page === "trabajadoras" && (
         <WorkersPage
  selectedBranch={selectedBranch}
/>
        )}

         {/* PAQUETES */}
        {page === "paquetes" && (
<PackagesPage
  selectedBranch={selectedBranch}
  pendingLaserSale={pendingLaserSale}
  setPendingLaserSale={setPendingLaserSale}
/>
        )}

        {/* ZONA LÁSER */}
     {page === "zonas-laser" && (
  <LaserZonesPage />
)}

     {/* CALCULADORA LÁSER */}
       {page === "calculadora-laser" && (
  <LaserQuotePage />
)}

       {/* VENTAS INTERNAS */}
        {page ===
          "ventas-internas" && (
       <InternalSalesPage
  selectedBranch={selectedBranch}
/>
        )}

        {/* VENTAS PRODUCTOS */}
        {page ===
          "ventas-productos" && (
          <ProductSalesPage
  selectedBranch={selectedBranch}
/>
        )}

        {page ===
          "servicios-pendientes" && (
          <PendingServicesPage
  selectedBranch={selectedBranch}
/>
        )}

        {page === "gastos" && (
          <ExpensesPage
  selectedBranch={selectedBranch}
/>
        )}

      </div>

    </div>

  );
}