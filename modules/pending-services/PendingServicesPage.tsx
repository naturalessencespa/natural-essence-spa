"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";


export default function PendingServicesPage() {

const [
  pendingSales,
  setPendingSales
] = useState<any[]>([]);

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

useEffect(() => {

  loadPendingSales();

}, []);

const loadPendingSales = async () => {

  const { data } = await supabase

    .from("pending_sales")

    .select(`

      *,

      clients(
        full_name
      )

    `)

    .order(
      "created_at",
      { ascending: false }
    );

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

        status:
          "Pendiente"

      })

      .select()

      .single();

  if (error) {

    alert(error.message);

    return;

  }

  alert("Cita creada.");

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

        <div className="flex justify-between items-center">

          <input

            type="text"

            placeholder="Buscar cliente..."

            className="border rounded-2xl p-3 w-[350px]"

          />

          <select className="border rounded-2xl p-3 w-[220px]">

            <option>Todos</option>
            <option>Pendiente</option>
            <option>Agendado</option>
            <option>Cancelado</option>

          </select>

        </div>

        <div className="mt-8 overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b">

                <th className="text-left p-4">Cliente</th>

                <th className="text-left p-4">Total</th>

                <th className="text-left p-4">Adelanto</th>

                <th className="text-left p-4">Saldo</th>

                <th className="text-left p-4">Estado</th>

                <th className="text-left p-4">Acciones</th>

              </tr>

            </thead>

            <tbody>

              {pendingSales.map((sale) => (

  <tr
    key={sale.id}
    className="border-b"
  >

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

      <button

      onClick={() =>
        openSale(sale)
      }

      className="bg-blue-600 text-white px-4 py-2 rounded-xl"

    >

      Ver detalle

    </button>

    <button

  onClick={() => {

    setSelectedSale(sale);

    setShowScheduleModal(true);

  }}

  className="bg-green-600 text-white px-4 py-2 rounded-xl ml-2"

>

  Agendar cita

</button>

    

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
    </div>






  );

} 