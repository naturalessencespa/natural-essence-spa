"use client";

import { useEffect, useState } from "react";

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


import SystemSettingsPage from "@/modules/system-settings/SystemSettingsPage";

import { supabase } from "@/lib/supabase";

export default function Home() {

const [page, setPage] = useState("dashboard");
const [branches, setBranches] = useState<any[]>([]);
const [selectedBranch, setSelectedBranch] = useState<number>(0);
const [session, setSession] = useState<any>(null);
const [profile, setProfile] = useState<any>(null);
const [loadingAuth, setLoadingAuth] = useState(true);
const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");
const [loginError, setLoginError] = useState("");
const [loginLoading, setLoginLoading] = useState(false);
const [changePasswordOpen, setChangePasswordOpen] = useState(false);
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [changePasswordError, setChangePasswordError] = useState("");
const [changePasswordSuccess, setChangePasswordSuccess] = useState("");
const [changePasswordLoading, setChangePasswordLoading] = useState(false);

const isAdmin = profile?.role === "admin";

useEffect(() => {
  let mounted = true;

  const loadUser = async (currentSession: any) => {
    if (!currentSession?.user) {
      if (mounted) {
        setSession(null);
        setProfile(null);
        setBranches([]);
        setSelectedBranch(0);
        setLoadingAuth(false);
      }
      return;
    }

    setSession(currentSession);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentSession.user.id)
      .eq("active", true)
      .single();

    if (profileError || !profileData) {
      await supabase.auth.signOut();
      if (mounted) {
        setSession(null);
        setProfile(null);
        setLoginError("Tu usuario no tiene un perfil activo en el sistema.");
        setLoadingAuth(false);
      }
      return;
    }

    if (!mounted) return;
    setProfile(profileData);

    if (profileData.role === "admin") {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("active", true)
        .order("id", { ascending: true });

      if (!error) {
        setBranches(data || []);
        if (data?.length) setSelectedBranch(Number(data[0].id));
      } else console.log(error);
    } else {
      const branchId = Number(profileData.branch_id);
      setSelectedBranch(branchId);

      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("id", branchId)
        .eq("active", true)
        .single();

      if (!error && data) setBranches([data]);
      else setBranches([]);
    }

    setLoadingAuth(false);
  };

  supabase.auth.getSession().then(({ data }) => loadUser(data.session));

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (_event, currentSession) => {
      loadUser(currentSession);
    }
  );

  return () => {
    mounted = false;
    authListener.subscription.unsubscribe();
  };
}, []);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoginError("");
  setLoginLoading(true);

  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail.trim(),
    password: loginPassword,
  });

  if (error) {
    setLoginError("Correo o contraseña incorrectos.");
  }
  setLoginLoading(false);
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  setPage("dashboard");
};

const handleChangePassword = async () => {
  setChangePasswordError("");
  setChangePasswordSuccess("");

  if (newPassword.length < 6) {
    setChangePasswordError("La contraseña debe tener mínimo 6 caracteres.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setChangePasswordError("Las contraseñas no coinciden.");
    return;
  }

  setChangePasswordLoading(true);

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    setChangePasswordError(error.message);
  } else {
    setChangePasswordSuccess("Contraseña actualizada correctamente.");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      setChangePasswordOpen(false);
      setChangePasswordSuccess("");
    }, 1500);
  }

  setChangePasswordLoading(false);
};

  const [sidebarOpen, setSidebarOpen] = useState(false);

const [
  pendingLaserSale,
  setPendingLaserSale
] = useState<any>(null);

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <img src="/logo.png" alt="Natural Essence" className="w-40 mx-auto mb-6 object-contain" />
          <p className="text-[#243847] font-medium">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Natural Essence" className="w-44 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#243847] text-center mb-2">Iniciar sesión</h1>
          <p className="text-gray-500 text-center mb-7">Accede al sistema de Natural Essence Spa</p>
          <div className="space-y-4">
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Correo electrónico" required className="w-full border rounded-2xl px-4 py-3" />
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Contraseña" required className="w-full border rounded-2xl px-4 py-3" />
            {loginError && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{loginError}</p>}
            <button type="submit" disabled={loginLoading} className="w-full bg-[#243847] text-white rounded-2xl px-4 py-3 font-semibold disabled:opacity-60">
              {loginLoading ? "Ingresando..." : "Ingresar"}
            </button>
          </div>
        </form>
      </div>
    );
  }

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

{isAdmin && (
<button
  onClick={() =>{
    setPage("parametros");
    setSidebarOpen(false);
  }}
  className={`text-left px-4 py-3 rounded-2xl transition ${
    page === "parametros"
      ? "bg-white text-[#243847]"
      : "hover:bg-white/10"
  }`}
>

  Parámetros

</button>
)}

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

  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
  {isAdmin ? (
    <select value={selectedBranch} onChange={(e) => setSelectedBranch(Number(e.target.value))} className="w-full md:w-64 border rounded-2xl px-4 py-3 bg-white shadow">
      {branches.map((branch) => (
        <option key={branch.id} value={branch.id}>📍 {branch.name}</option>
      ))}
    </select>
  ) : (
    <div className="w-full md:w-64 border rounded-2xl px-4 py-3 bg-white shadow text-[#243847] font-medium">
      📍 {branches[0]?.name || "Sede asignada"}
    </div>
  )}

  <div className="flex items-center gap-2">
   <div className="text-right hidden sm:block">
  <p className="text-sm font-semibold text-[#243847]">
    {isAdmin ? "Administrador" : profile.full_name}
  </p>
    </div>
    <button
  onClick={() => {
    setChangePasswordOpen(true);
    setChangePasswordError("");
    setChangePasswordSuccess("");
  }}
  className="border rounded-2xl px-4 py-3 bg-white shadow hover:bg-gray-50 text-[#243847] font-medium"
>
  Cambiar contraseña
</button>
    <button onClick={handleLogout} className="border rounded-2xl px-4 py-3 bg-white shadow hover:bg-gray-50 text-[#243847] font-medium">
      Cerrar sesión
    </button>
  </div>
</div>

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
  <ServicesPage
    selectedBranch={selectedBranch}
  />
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

  {page === "zonas-laser" && (
  <LaserZonesPage
    selectedBranch={selectedBranch}
  />
)}

     {/* CALCULADORA LÁSER */}
       {page === "calculadora-laser" && (
 <LaserQuotePage
  selectedBranch={selectedBranch}
/>
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

        {isAdmin && page === "parametros" && (
  <SystemSettingsPage
    selectedBranch={selectedBranch}
  />
)}

      </div>
{changePasswordOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

      <h2 className="text-xl font-bold text-[#243847] mb-2">
        Cambiar contraseña
      </h2>

      <p className="text-sm text-gray-500 mb-5">
        Ingresa tu nueva contraseña.
      </p>

      <div className="space-y-4">

        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nueva contraseña"
          className="w-full border rounded-2xl px-4 py-3"
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirmar nueva contraseña"
          className="w-full border rounded-2xl px-4 py-3"
        />

        {changePasswordError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
            {changePasswordError}
          </p>
        )}

        {changePasswordSuccess && (
          <p className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-3">
            {changePasswordSuccess}
          </p>
        )}

        <div className="flex gap-3 pt-2">

          <button
            onClick={() => {
              setChangePasswordOpen(false);
              setNewPassword("");
              setConfirmPassword("");
              setChangePasswordError("");
            }}
            className="flex-1 border rounded-2xl px-4 py-3 font-medium"
          >
            Cancelar
          </button>

          <button
            onClick={handleChangePassword}
            disabled={changePasswordLoading}
            className="flex-1 bg-[#243847] text-white rounded-2xl px-4 py-3 font-semibold disabled:opacity-60"
          >
            {changePasswordLoading
              ? "Guardando..."
              : "Guardar contraseña"}
          </button>

        </div>

      </div>
    </div>
  </div>
)}
    </div>

  );
}