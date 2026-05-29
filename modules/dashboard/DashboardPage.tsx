"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {

  const [todayAppointments,
  setTodayAppointments] =
  useState<any[]>([]);

  const [salesToday,
  setSalesToday] =
  useState(0);

const [clientsToday,
  setClientsToday] =
  useState(0);

const [servicesToday,
  setServicesToday] =
  useState(0);

const [ticketAverage,
  setTicketAverage] =
  useState(0);

const [salesByWorker,
  setSalesByWorker] =
  useState<any[]>([]);

const [salesByService,
  setSalesByService] =
  useState<any[]>([]);

  const [topClients,
  setTopClients] =
  useState<any[]>([]);

  const [inactiveClients,
  setInactiveClients] =
  useState<any[]>([]);

  const [salesByDay,
  setSalesByDay] =
  useState<any[]>([]);

const [startDate,
  setStartDate] =
  useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

const [endDate,
  setEndDate] =
  useState(
    new Date()
      .toISOString()
      .split("T")[0]
  );

useEffect(() => {

  loadAppointments();

}, [startDate, endDate]);


const loadAppointments =
  async () => {



    const { data, error } =
      await supabase

        .from("appointments")

        .select(`
          *,
          clients(full_name),
          services(name),
          workers(name)
        `)

        .gte(
          "appointment_date",
          startDate
        )

        .lte(
          "appointment_date",
          endDate
        )

        .eq(
          "status",
          "Atendida"
        )

        .order(
          "appointment_date",
        { ascending: true }
        )
        .order(
          "start_time",
          { ascending: true }
                );

    if (error) {

      console.log(error);

      return;
    }

    setTodayAppointments(
      data || []
    );

    const sales =

  (data || []).reduce(
    (sum, appointment) =>

      sum +

      Number(
        appointment.final_price || 0
      ),

    0
  );

setSalesToday(
  sales
);

setClientsToday(
  data?.length || 0
);

setServicesToday(
  data?.length || 0
);

setTicketAverage(

  data?.length

    ? sales /
      data.length

    : 0
);

const dailySales: any = {};

(data || []).forEach(
  (appointment) => {

    const date =
      appointment.appointment_date;

    if (!dailySales[date]) {

      dailySales[date] = 0;

    }

    dailySales[date] += Number(
      appointment.final_price || 0
    );

  }
);

setSalesByDay(

  Object.entries(dailySales).map(
    ([date, sales]) => ({
      date,
      sales
    })
  )

);

const workerSales: any = {};

(data || []).forEach(
  (appointment) => {

    const worker =
      appointment.workers?.name ||
      "Sin asignar";

    if (!workerSales[worker]) {

      workerSales[worker] = 0;

    }

    workerSales[worker] += Number(
      appointment.final_price || 0
    );

  }
);

setSalesByWorker(

  Object.entries(workerSales).map(
    ([worker, sales]) => ({
      worker,
      sales
    })
  )

);

const serviceSales: any = {};

(data || []).forEach(
  (appointment) => {

    const service =
      appointment.services?.name ||
      "Sin servicio";

    if (!serviceSales[service]) {

      serviceSales[service] = 0;

    }

    serviceSales[service] += Number(
      appointment.final_price || 0
    );

  }
);

setSalesByService(

  Object.entries(serviceSales).map(
    ([service, sales]) => ({
      service,
      sales
    })
  )

);

const clientsData: any = {};

(data || []).forEach(
  (appointment) => {

    const client =
      appointment.clients?.full_name ||
      "Sin nombre";

    if (!clientsData[client]) {

      clientsData[client] = {
        visits: 0,
        spent: 0
      };

    }

    clientsData[client].visits += 1;

    clientsData[client].spent += Number(
      appointment.final_price || 0
    );

  }
);

setTopClients(

  Object.entries(clientsData).map(
    ([client, values]: any) => ({
      client,
      visits: values.visits,
      spent: values.spent
    })
  )

);

const { data: allAppointments } =
  await supabase

    .from("appointments")

    .select(`
      appointment_date,
      clients(full_name)
    `)

    .eq(
      "status",
      "Atendida"
    );

const clientsLastVisit: any = {};

(allAppointments || []).forEach(
  (appointment) => {

    const client =
     appointment.clients?.[0]?.full_name ||
     "Sin nombre";

    if (!client) return;

    const visitDate =
      appointment.appointment_date;

    if (
      !clientsLastVisit[client] ||
      visitDate >
      clientsLastVisit[client]
    ) {

      clientsLastVisit[client] =
        visitDate;

    }

  }
);

const today =
  new Date();

const inactive =
  Object.entries(
    clientsLastVisit
  ).map(
    ([client, lastVisit]) => {

      const diffTime =
        today.getTime() -
        new Date(
          String(lastVisit)
        ).getTime();

      const days =
        Math.floor(
          diffTime /
          (1000 * 60 * 60 * 24)
        );

      return {
        client,
        lastVisit,
        days
      };

    }
  );

setInactiveClients(

  inactive
    .filter(
      (client) =>
        client.days >= 1
    )
    .sort(
      (a, b) =>
        b.days - a.days
    )

);

};



  return (
    <div>
      <h1 className="text-5xl font-bold text-[#243847] mb-8">
        Dashboard
      </h1>

      <div className="flex gap-4 mb-8">

  <div>
    <label className="block text-sm text-gray-500 mb-1">
      Desde
    </label>

    <input
      type="date"
      value={startDate}
      onChange={(e) =>
        setStartDate(e.target.value)
      }
      className="border rounded-xl p-2"
    />
  </div>

  <div>
    <label className="block text-sm text-gray-500 mb-1">
      Hasta
    </label>

    <input
      type="date"
      value={endDate}
      onChange={(e) =>
        setEndDate(e.target.value)
      }
      className="border rounded-xl p-2"
    />
  </div>

</div>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-3xl shadow">
          <p className="text-gray-500">
            Ventas
          </p>
          <h2 className="text-4xl font-bold mt-2">
            S/ {salesToday.toFixed(2)}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <p className="text-gray-500">
            Clientes atendidos
          </p>
          <h2 className="text-4xl font-bold mt-2">
            {clientsToday}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <p className="text-gray-500">
            Servicios realizados
          </p>
          <h2 className="text-4xl font-bold mt-2">
            {servicesToday}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <p className="text-gray-500">
            Ticket promedio
          </p>
          <h2 className="text-4xl font-bold mt-2">
            S/ {ticketAverage.toFixed(2)}
          </h2>
        </div>

      </div>

      <div className="bg-white rounded-3xl shadow mt-8 p-6">

        <h2 className="text-2xl font-bold text-[#243847] mb-4">
          Citas Atendidas
        </h2>

       <table className="w-full">

  <thead>

    <tr>

      <th className="text-left p-3">
        Fecha
      </th>

      <th className="text-left p-3">
        Hora
      </th>

      <th className="text-left p-3">
        Cliente
      </th>

      <th className="text-left p-3">
        Servicio
      </th>

      <th className="text-left p-3">
        Trabajadora
      </th>

      <th className="text-left p-3">
        Estado
      </th>

    </tr>

  </thead>

  <tbody>

    {todayAppointments.map(
      (appointment) => (

        <tr
          key={appointment.id}
          className="border-t"
        >

          <td className="p-3">
              {new Date(
                appointment.appointment_date
              ).toLocaleDateString("es-PE")}
          </td>

          <td className="p-3">

            {
              appointment.start_time
            }

          </td>

          <td className="p-3">


            {
                appointment.clients?.full_name
            }

          </td>

          <td className="p-3">

            {
              appointment.services
                ?.name
            }

          </td>

          <td className="p-3">

            {
              appointment.workers
                ?.name
            }

          </td>

          <td className="p-3">

            {
              appointment.status
            }

          </td>

        </tr>

      )
    )}

  </tbody>

</table>

      </div>

      <div className="bg-white rounded-3xl shadow mt-8 p-6">

  <h2 className="text-2xl font-bold text-[#243847] mb-4">
    Ventas por Día
  </h2>

  <table className="w-full">

    <thead>

      <tr>

        <th className="text-left p-3">
          Fecha
        </th>

        <th className="text-left p-3">
          Ventas
        </th>

      </tr>

    </thead>

    <tbody>

      {salesByDay
        .sort(
          (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        )
        .map((item) => (

          <tr
            key={item.date}
            className="border-t"
          >

            <td className="p-3">

              {new Date(
                item.date
              ).toLocaleDateString(
                "es-PE"
              )}

            </td>

            <td className="p-3 font-semibold">

              S/ {
                Number(
                  item.sales
                ).toFixed(2)
              }

            </td>

          </tr>

      ))}

    </tbody>

  </table>

</div>

  <div className="bg-white rounded-3xl shadow mt-8 p-6">

  <h2 className="text-2xl font-bold text-[#243847] mb-4">
    Ventas por Trabajadora
  </h2>

  <table className="w-full">

    <thead>

      <tr>

        <th className="text-left p-3">
          Trabajadora
        </th>

        <th className="text-left p-3">
          Ventas
        </th>

      </tr>

    </thead>

    <tbody>

      {salesByWorker
        .sort(
          (a, b) =>
            b.sales - a.sales
        )
        .map((item) => (

          <tr
            key={item.worker}
            className="border-t"
          >

            <td className="p-3">
              {item.worker}
            </td>

            <td className="p-3 font-semibold">
              S/ {Number(item.sales).toFixed(2)}
            </td>

          </tr>

      ))}

    </tbody>

  </table>

</div>
<div className="bg-white rounded-3xl shadow mt-8 p-6">

  <h2 className="text-2xl font-bold text-[#243847] mb-4">
    Servicios Más Vendidos
  </h2>

  <table className="w-full">

    <thead>

      <tr>

        <th className="text-left p-3">
          Servicio
        </th>

        <th className="text-left p-3">
          Ingresos
        </th>

      </tr>

    </thead>

    <tbody>

      {salesByService
        .sort(
          (a, b) =>
            b.sales - a.sales
        )
        .map((item) => (

          <tr
            key={item.service}
            className="border-t"
          >

            <td className="p-3">
              {item.service}
            </td>

            <td className="p-3 font-semibold">
              S/ {Number(item.sales).toFixed(2)}
            </td>

          </tr>

      ))}

    </tbody>

  </table>

</div>

<div className="bg-white rounded-3xl shadow mt-8 p-6">

  <h2 className="text-2xl font-bold text-[#243847] mb-4">
    Mejores Clientes
  </h2>

  <table className="w-full">

    <thead>

      <tr>

        <th className="text-left p-3">
          Cliente
        </th>

        <th className="text-left p-3">
          Visitas
        </th>

        <th className="text-left p-3">
          Total Gastado
        </th>

      </tr>

    </thead>

    <tbody>

      {topClients
        .sort(
          (a, b) =>
            b.spent - a.spent
        )
        .slice(0, 20)
        .map((client) => (

          <tr
            key={client.client}
            className="border-t"
          >

            <td className="p-3">
              {client.client}
            </td>

            <td className="p-3">
              {client.visits}
            </td>

            <td className="p-3 font-semibold">
              S/ {client.spent.toFixed(2)}
            </td>

          </tr>

      ))}

    </tbody>

  </table>

</div>


<div className="bg-white rounded-3xl shadow mt-8 p-6">

  <h2 className="text-2xl font-bold text-[#243847] mb-4">
    Clientes Inactivos
  </h2>

  <table className="w-full">

    <thead>

      <tr>

        <th className="text-left p-3">
          Cliente
        </th>

        <th className="text-left p-3">
          Última Visita
        </th>

        <th className="text-left p-3">
          Días Sin Venir
        </th>

      </tr>

    </thead>

    <tbody>

      {inactiveClients
        .slice(0, 20)
        .map((client) => (

          <tr
            key={client.client}
            className="border-t"
          >

            <td className="p-3">
              {client.client}
            </td>

            <td className="p-3">
              {new Date(
                client.lastVisit
              ).toLocaleDateString(
                "es-PE"
              )}
            </td>

            <td className="p-3 font-semibold">
              {client.days}
            </td>

          </tr>

      ))}

    </tbody>

  </table>

</div>
    </div>
  );
}