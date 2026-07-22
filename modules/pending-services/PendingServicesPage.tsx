"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";


type Props = {
  selectedBranch: number;
};

export default function PendingServicesPage({
  selectedBranch,
}: Props) {

const [
  pendingSales,
  setPendingSales
] = useState<any[]>([]);

const [
  search,
  setSearch
] = useState("");

const [
  statusFilter,
  setStatusFilter
] = useState("Pendiente");

const [
  selectedSale,
  setSelectedSale
] = useState<any>(null);

const [
  showDetailModal,
  setShowDetailModal
] = useState(false);

const [
  showScheduleModal,
  setShowScheduleModal
] = useState(false);

const [
  scheduleDate,
  setScheduleDate
] = useState("");

const [
  scheduleTime,
  setScheduleTime
] = useState("");

const [
  branchId,
  setBranchId
] = useState("");

const [
  workerId,
  setWorkerId
] = useState("");

const [
  workers,
  setWorkers
] = useState<any[]>([]);

const [
  branches,
  setBranches
] = useState<any[]>([]);

const [
  saleItems,
  setSaleItems
] = useState<any[]>([]);

const [sellerWorker, setSellerWorker] = useState<any>(null);

const [
  showCreateModal,
  setShowCreateModal
] = useState(false);

const [
  clients,
  setClients
] = useState<any[]>([]);

const [
  services,
  setServices
] = useState<any[]>([]);

const [
  clientSearch,
  setClientSearch
] = useState("");

const [
  clientId,
  setClientId
] = useState("");

const [
  origin,
  setOrigin
] = useState("MOSTRADOR");

const [
  serviceId,
  setServiceId
] = useState("");

const [
  servicePrice,
  setServicePrice
] = useState("");

const [
  salesCart,
  setSalesCart
] = useState<any[]>([]);

const [
  soldTotal,
  setSoldTotal
] = useState("");

const [
  soldTotalEdited,
  setSoldTotalEdited
] = useState(false);


const [
  advance,
  setAdvance
] = useState("");

const [
  notes,
  setNotes
] = useState("");

const originalTotal = salesCart.reduce(

  (sum, item) => sum + Number(item.sold_price),

  0

);

const soldTotalValue =

  soldTotal === ""

    ? originalTotal

    : Number(soldTotal);

const calculatedBalance = Math.max(

  soldTotalValue - Number(advance || 0),

  0

);

useEffect(() => {

  if (!soldTotalEdited) {

    setSoldTotal(String(originalTotal));

  }

  if (Number(advance || 0) > soldTotalValue) {

    setAdvance(String(soldTotalValue));

  }

}, [originalTotal, soldTotalEdited]);

useEffect(() => {

  loadPendingSales();

}, [statusFilter]);

useEffect(() => {

  loadFormData();

}, []);



const loadFormData = async () => {

  const { data: clientsData } = await supabase

    .from("clients")

    .select("*")

    .eq("active", true)

    .order("full_name");

  setClients(clientsData || []);

  const { data: servicesData } = await supabase

    .from("services")

    .select("*")

    .order("name");

  setServices(servicesData || []);

};

const loadPendingSales = async () => {

  let query = supabase

    .from("pending_sales")

   .select(`
  *,
  clients(
    full_name
  ),
  workers:sold_by_worker_id(
    name
  )
`)

    .order(
      "created_at",
      { ascending: false }
    );

  if (statusFilter !== "Todos") {

    query = query.eq(
      "status",
      statusFilter
    );

  }

  const { data } =
    await query;

  setPendingSales(
    data || []
  );

  const { data: workersData } =

  await supabase

    .from("workers")

    .select("id,name")

    .eq("active", true)

    .order("name");

setWorkers(
  workersData || []
);

const { data: branchesData } =

  await supabase

    .from("branches")

    .select("id,name")

    .eq("active", true)

    .order("name");

setBranches(
  branchesData || []
);

};




const openSale = async (
  sale: any
) => {

  const { data } =
    await supabase

      .from(
        "pending_sale_items"
      )

      .select("*")

      .eq(
        "pending_sale_id",
        sale.id
      );

  setSaleItems(
    data || []
  );

  setSellerWorker(null);

if (sale.sold_by_worker_id) {

  const { data: worker } = await supabase

    .from("workers")

    .select("name")

    .eq("id", sale.sold_by_worker_id)

    .single();

  setSellerWorker(worker);

}

  setSelectedSale(
    sale
  );

  setShowDetailModal(
    true
  );

};

const createAppointmentFromPendingSale =
async () => {

  if (

    !scheduleDate ||

    !scheduleTime ||

    !workerId ||

    !branchId

  ) {

    alert("Complete todos los datos.");

    return;

  }

  const { data: items } =

    await supabase

      .from("pending_sale_items")

      .select("*")

      .eq(
        "pending_sale_id",
        selectedSale.id
      );

  if (!items || items.length === 0) {

    alert("Esta venta no tiene servicios.");

    return;

  }

  let totalMinutes = 0;

  for (const item of items) {

    const { data: service } =

      await supabase

        .from("services")

        .select("duration")

        .eq(
          "id",
          item.service_id
        )

        .single();

    const duration =
      service?.duration || "";

    if (

      duration
        .toLowerCase()
        .includes("hora")

    ) {

      totalMinutes +=
        (
          parseInt(duration) || 1
        ) * 60;

    }

    else if (

      duration
        .toLowerCase()
        .includes("min")

    ) {

      totalMinutes +=
        parseInt(duration) || 60;

    }

    else {

      totalMinutes += 60;

    }

  }

  const start =
    new Date(
      `${scheduleDate}T${scheduleTime}`
    );

  const end =
    new Date(start);

  end.setMinutes(
    end.getMinutes() +
    totalMinutes
  );

  const endTime =
    end
      .toTimeString()
      .slice(0,5);

  const { data: appointment, error } =

    await supabase

      .from("appointments")

      .insert({

  client_id:
    selectedSale.client_id,

  service_id:
    items[0].service_id,

  worker_id:
    Number(workerId),

  branch_id:
    Number(branchId),

  appointment_date:
    scheduleDate,

  start_time:
    scheduleTime,

  end_time:
    endTime,

  original_price:
    Number(selectedSale.sold_total),

  final_price:
    Number(selectedSale.sold_total),

  status:
    "Pendiente"

})

      .select()

      .single();

  if (error) {

    alert(error.message);

    return;

  }

  const reservedServices = items.map((item) => ({

  appointment_id: appointment.id,

  service_id: item.service_id

}));

const { error: reservedError } =

  await supabase

    .from("appointment_reserved_services")

    .insert(reservedServices);

if (reservedError) {

  alert(reservedError.message);

  return;

}

if (Number(selectedSale.advance) > 0) {

  const { error: advanceError } =

    await supabase

      .from("appointment_advances")

      .insert({

        appointment_id:
          appointment.id,

        client_id:
          selectedSale.client_id,

        amount:
          Number(selectedSale.advance),

        status:
          "Activo"

      });

  if (advanceError) {

    alert(advanceError.message);

    return;

  }

}

const { error: pendingError } =

  await supabase

    .from("pending_sales")

    .update({

      status:
        "Agendado",

      appointment_generated_id:
        appointment.id

    })

    .eq(
      "id",
      selectedSale.id
    );

if (pendingError) {

  alert(pendingError.message);

  return;

}

  

  setShowScheduleModal(false);

loadPendingSales();

alert("Cita creada correctamente.");

};

const savePendingSale = async () => {

  if (!clientId) {

    alert("Seleccione un cliente.");
    return;

  }

  if (salesCart.length === 0) {

    alert("Agregue al menos un servicio.");
    return;

  }

if (Number(advance || 0) > soldTotalValue) {

  alert("El adelanto no puede ser mayor al total pactado.");
  return;

}

  const originalTotal = salesCart.reduce(

    (sum, item) => sum + Number(item.sold_price),

    0

  );

const finalTotal = soldTotalValue;

  const { data: sale, error } = await supabase

    .from("pending_sales")

    .insert({

      client_id: Number(clientId),

      sold_by_worker_id: null,

      original_total: originalTotal,

      sold_total: finalTotal,

      advance: Number(advance || 0),

      origin,

      notes

    })

    .select()

    .single();

  if (error) {

    alert(error.message);
    return;

  }

  const items = salesCart.map(item => ({

    pending_sale_id: sale.id,

    service_id: item.service_id,

    service_name: item.service_name,

    original_price: Number(item.sold_price),

    sold_price: Number(item.sold_price)

  }));

  const { error: itemsError } = await supabase

    .from("pending_sale_items")

    .insert(items);

  if (itemsError) {

    alert(itemsError.message);
    return;

  }

 resetCreateSaleForm();

setShowCreateModal(false);

  loadPendingSales();

  alert("Venta registrada correctamente.");

};
const resetCreateSaleForm = () => {

  setClientId("");
  setClientSearch("");
  setOrigin("MOSTRADOR");
  setServiceId("");
  setServicePrice("");
  setSalesCart([]);
  setSoldTotal("");
  setSoldTotalEdited(false);
  setAdvance("");
  setNotes("");

};

const deletePendingSale = async (id: number) => {

  const confirmDelete = confirm(
    "¿Desea cancelar esta venta?"
  );

  if (!confirmDelete) return;

  const { error } = await supabase

    .from("pending_sales")

    .update({

      status: "Cancelado"

    })

    .eq("id", id);

  if (error) {

    alert(error.message);

    return;

  }

  loadPendingSales();

  alert("Venta cancelada correctamente.");

};

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-5xl font-bold text-[#243847]">

          Servicios Pendientes

        </h1>

        <p className="text-gray-500 mt-2">

          Aquí se mostrarán todas las ventas futuras pendientes de programar.

        </p>

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

    <input
      type="text"
      placeholder="Buscar cliente..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      className="border rounded-2xl p-3 w-full sm:w-[350px]"
    />

    <button
      onClick={() => {

  resetCreateSaleForm();

  setShowCreateModal(true);

}}
      className="bg-[#243847] text-white px-5 py-3 rounded-2xl whitespace-nowrap"
    >
      + Nueva venta
    </button>

  </div>

  <select
    value={statusFilter}
    onChange={(e)=>setStatusFilter(e.target.value)}
    className="border rounded-2xl p-3 w-full sm:w-[220px]"
  >

    <option>Pendiente</option>
    <option>Agendado</option>
    <option>Consumido</option>
    <option>Cancelado</option>
    <option>Todos</option>

  </select>

</div>


        <div className="mt-8 overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="text-left p-4">Fecha venta</th>

                <th className="text-left p-4">Cliente</th>

                <th className="text-left p-4">Total</th>

                <th className="text-left p-4">Adelanto</th>

                <th className="text-left p-4">Saldo</th>

                <th className="text-left p-4">Estado</th>

                <th className="text-left p-4">Acciones</th>

              </tr>

            </thead>

            <tbody>

              {pendingSales

.filter((sale)=>

sale.clients?.full_name

.toLowerCase()

.includes(

search.toLowerCase()

)

)

.map((sale)=>(


  <tr
    key={sale.id}
    className="border-b"


  >

      <td className="p-4">

  {new Date(sale.created_at).toLocaleDateString("es-PE")}

</td>

    <td className="p-4">

      {sale.clients?.full_name}

    </td>

    <td className="p-4">

      S/{sale.sold_total}

    </td>

    <td className="p-4">

      S/{sale.advance}

    </td>

    <td className="p-4">

      S/{
        Number(sale.sold_total) -
        Number(sale.advance)
      }

    </td>

    <td className="p-4">

      {sale.status}

    </td>

   <td className="p-4">

  <div className="flex flex-wrap gap-2">

    <button
      onClick={() => openSale(sale)}
      className="bg-blue-600 text-white px-4 py-2 rounded-xl"
    >
      Ver detalle
    </button>

    {sale.status === "Pendiente" && (

      <button
        onClick={() => deletePendingSale(sale.id)}
        className="bg-red-600 text-white px-4 py-2 rounded-xl"
      >
        Cancelar
      </button>

    )}

    {sale.status === "Pendiente" ? (

      <button
        onClick={() => {

          setSelectedSale(sale);

          setShowScheduleModal(true);

        }}
        className="bg-green-600 text-white px-4 py-2 rounded-xl"
      >
        Agendar cita
      </button>

    ) : (

      <button
        disabled
        className="bg-gray-300 text-gray-500 px-4 py-2 rounded-xl cursor-not-allowed"
      >
        Agendar cita
      </button>

    )}

  </div>

</td>
  </tr>

))}

            </tbody>

          </table>

        </div>

      </div>

      {showDetailModal && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl p-8 w-[650px]">

      <h2 className="text-3xl font-bold mb-6">

        Venta futura

      </h2>

      <div className="mb-6 border rounded-2xl p-4 bg-gray-50 space-y-2">

  <div className="flex justify-between">
    <span>Origen</span>
    <strong>{selectedSale?.origin}</strong>
  </div>

  <div className="flex justify-between">
    <span>Fecha de venta</span>
    <strong>
      {new Date(selectedSale.created_at).toLocaleDateString("es-PE")}
    </strong>
  </div>

{sellerWorker && (

    <div className="flex justify-between">
      <span>Trabajadora que comisiona</span>
      <strong>{sellerWorker?.name}</strong>
    </div>

  )}

  {selectedSale?.notes && (

    <div>

      <span className="font-medium">
        Observaciones
      </span>

      <p>{selectedSale.notes}</p>

    </div>

  )}

</div>

      <div className="space-y-2">

        {saleItems.map((item) => (

          <div

            key={item.id}

            className="flex justify-between border-b py-3"

          >

            <span>

              {item.service_name}

            </span>

            <strong>

              S/{item.sold_price}

            </strong>

          </div>

        ))}

      </div>

      <div className="mt-6 border-t pt-5 space-y-2">

        <div className="flex justify-between">

          <span>Total vendido</span>

          <strong>

            S/{selectedSale?.sold_total}

          </strong>

        </div>

        <div className="flex justify-between">

          <span>Adelanto</span>

          <strong>

            S/{selectedSale?.advance}

          </strong>

        </div>

        <div className="flex justify-between">

          <span>Saldo</span>

          <strong className="text-red-600">

            S/{

              Number(
                selectedSale?.sold_total || 0
              ) -

              Number(
                selectedSale?.advance || 0
              )

            }

          </strong>

        </div>

      </div>

      <div className="flex justify-end mt-8">

        <button

          onClick={() =>
            setShowDetailModal(false)
          }

          className="bg-gray-300 px-6 py-3 rounded-2xl"

        >

          Cerrar

        </button>

      </div>

    </div>

  </div>

)}


{showScheduleModal && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-3xl p-8 w-[500px]">

<h2 className="text-3xl font-bold mb-6">

Agendar cita

</h2>

<div className="space-y-5">

<input

type="date"

value={scheduleDate}

onChange={(e)=>

setScheduleDate(e.target.value)

}

className="w-full border rounded-xl p-3"

/>

<input

type="time"

value={scheduleTime}

onChange={(e)=>

setScheduleTime(e.target.value)

}

className="w-full border rounded-xl p-3"

/>

<select

value={workerId}

onChange={(e)=>

setWorkerId(e.target.value)

}

className="w-full border rounded-xl p-3"

>

<option value="">

Seleccionar trabajadora

</option>

{workers.map(worker=>(

<option

key={worker.id}

value={worker.id}

>

{worker.name}

</option>

))}

</select>

<select

value={branchId}

onChange={(e)=>

setBranchId(e.target.value)

}

className="w-full border rounded-xl p-3"

>

<option value="">

Seleccionar sede

</option>

{branches.map(branch=>(

<option

key={branch.id}

value={branch.id}

>

{branch.name}

</option>

))}

</select>

</div>

<div className="flex justify-end gap-3 mt-8">

<button

onClick={()=>

setShowScheduleModal(false)

}

className="bg-gray-300 px-5 py-3 rounded-2xl"

>

Cancelar

</button>

<button

onClick={
createAppointmentFromPendingSale
}

className="bg-green-600 text-white px-5 py-3 rounded-2xl"

>

Crear cita

</button>

</div>

</div>

</div>

)}

{showCreateModal && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <div className="bg-white rounded-3xl p-5 md:p-8 w-[95vw] max-w-5xl max-h-[95vh] overflow-y-auto">

    <h2 className="text-3xl font-bold mb-8">
      Nueva venta futura
    </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div>

        <label className="block mb-2 font-medium">
          Buscar cliente
        </label>

        <input
          type="text"
          value={clientSearch}
          onChange={(e)=>setClientSearch(e.target.value)}
          placeholder="Nombre del cliente..."
          className="w-full border rounded-xl p-3"
        />

      </div>

      <div>

        <label className="block mb-2 font-medium">
          Cliente
        </label>

        <select
          value={clientId}
          onChange={(e)=>setClientId(e.target.value)}
          className="w-full border rounded-xl p-3"
        >

          <option value="">
            Seleccionar cliente
          </option>

          {clients
            .filter(client =>
              client.full_name
                .toLowerCase()
                .includes(clientSearch.toLowerCase())
            )
            .map(client => (

              <option
                key={client.id}
                value={client.id}
              >
                {client.full_name}
              </option>

            ))}

        </select>

      </div>

    </div>

    <div className="mt-6">

      <label className="block mb-2 font-medium">
        Origen de la venta
      </label>

      <select
        value={origin}
        onChange={(e)=>setOrigin(e.target.value)}
        className="w-full border rounded-xl p-3"
      >

        <option value="MOSTRADOR">
          Mostrador
        </option>

        <option value="WHATSAPP">
          WhatsApp
        </option>

        <option value="VENTA_INTERNA">
          Venta interna
        </option>

      </select>

    </div>

    <div className="mt-8">

      <label className="block mb-3 font-medium">
        Agregar servicio
      </label>

     <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_140px] gap-4">

        <select
          value={serviceId}
          onChange={(e)=>{

            setServiceId(e.target.value);

            const service = services.find(
              s => s.id === Number(e.target.value)
            );

            if(service){

              setServicePrice(String(service.price));

            }

          }}
          className="border rounded-xl p-3"
        >

          <option value="">
            Seleccionar servicio
          </option>

          {services.map(service=>(

            <option
              key={service.id}
              value={service.id}
            >
              {service.name}
            </option>

          ))}

        </select>

        <input
          type="number"
          value={servicePrice}
          onChange={(e)=>setServicePrice(e.target.value)}
          className="border rounded-xl p-3"
        />

        <button
          onClick={()=>{

            if(!serviceId) return;

            const service = services.find(
              s=>s.id===Number(serviceId)
            );

            if(!service) return;

            setSalesCart([
              ...salesCart,
              {
                service_id:service.id,
                service_name:service.name,
                sold_price:Number(servicePrice)
              }
            ]);

            setServiceId("");
            setServicePrice("");

          }}
        className="bg-green-600 text-white rounded-xl py-3"
        >
          Agregar
        </button>

      </div>

    </div>

        {salesCart.length > 0 && (

      <div className="mt-8 border rounded-2xl overflow-x-auto">

       <div className="grid min-w-[520px] grid-cols-[1fr_150px_120px] bg-gray-100 p-4 font-semibold">

          <div>Servicio</div>

          <div className="text-center">
            Precio
          </div>

          <div></div>

        </div>

        {salesCart.map((item, index) => (

          <div
            key={index}
         className="grid min-w-[520px] grid-cols-[1fr_150px_120px] items-center border-t p-4"
          >

            <div>

              {item.service_name}

            </div>

            <div className="text-center">

              S/{Number(item.sold_price).toFixed(2)}

            </div>

            <div className="text-right">

              <button
                onClick={() => {

                  setSalesCart(
                    salesCart.filter((_, i) => i !== index)
                  );

                }}
                className="text-red-600 hover:underline"
              >

                Eliminar

              </button>

            </div>

          </div>

        ))}

      </div>

    )}

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

  <div>

    <label className="block mb-2 font-medium">
      Total original
    </label>

    <input
      type="number"
      value={originalTotal}
      readOnly
      className="w-full border rounded-xl p-3 bg-gray-100"
    />

  </div>

  <div>

    <label className="block mb-2 font-medium">
      Total pactado
    </label>

    <input
      type="number"
      value={soldTotal}
      onChange={(e)=>{

  setSoldTotal(e.target.value);

  setSoldTotalEdited(true);

}}
      className="w-full border rounded-xl p-3"
    />

  </div>

  <div>

    <label className="block mb-2 font-medium">
      Adelanto
    </label>

    <input
      type="number"
      value={advance}
      onChange={(e)=>setAdvance(e.target.value)}
      className="w-full border rounded-xl p-3"
    />

  </div>

  <div>

    <label className="block mb-2 font-medium">
      Saldo
    </label>

    <input
      type="number"
      value={calculatedBalance}
      readOnly
      className="w-full border rounded-xl p-3 bg-gray-100"
    />

  </div>

  <div className="md:col-span-2">

    <label className="block mb-2 font-medium">
      Observaciones
    </label>

    <input
      type="text"
      value={notes}
      onChange={(e)=>setNotes(e.target.value)}
      className="w-full border rounded-xl p-3"
    />

  </div>

</div>

    <div className="flex justify-end gap-3 mt-8">

      <button
        onClick={() => {

  resetCreateSaleForm();

  setShowCreateModal(false);

}}
        className="bg-gray-300 px-6 py-3 rounded-2xl"
      >
        Cancelar
      </button>

    <button
  onClick={savePendingSale}
  className="bg-[#243847] text-white px-6 py-3 rounded-2xl"
>
  Guardar venta
</button>

    </div>

  </div>

</div>

)}

    </div>

    
  );

} 