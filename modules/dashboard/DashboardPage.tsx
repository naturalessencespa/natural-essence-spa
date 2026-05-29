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

  useEffect(() => {

  loadAppointments();

}, []);

const loadAppointments =
  async () => {

  const now =
  new Date();

const today =
  `${now.getFullYear()}-${
    String(
      now.getMonth() + 1
    ).padStart(2, "0")
  }-${
    String(
      now.getDate()
    ).padStart(2, "0")
  }`;

    const { data, error } =
      await supabase

        .from("appointments")

        .select(`
          *,
          clients(full_name),
          services(name),
          workers(name)
        `)

        .eq(
          "appointment_date",
          today
        )

        .eq(
          "status",
          "Atendida"
        )

        .order(
          "start_time"
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

};

  return (
    <div>
      <h1 className="text-5xl font-bold text-[#243847] mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-3xl shadow">
          <p className="text-gray-500">
            Ventas del día
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
          Agenda del Día
        </h2>

       <table className="w-full">

  <thead>

    <tr>

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

            {
              appointment.start_time
            }

          </td>

          <td className="p-3">

            {
              appointment.clients
                ?.full_name
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

    </div>
  );
}