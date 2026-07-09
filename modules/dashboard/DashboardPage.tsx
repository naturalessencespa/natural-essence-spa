"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";  
import * as XLSX from "xlsx";

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

  const [
  workerEffectiveness,
  setWorkerEffectiveness
] = useState<any[]>([]);

const [salesByService,
  setSalesByService] =
  useState<any[]>([]);

  const [
  additionalSales,
  setAdditionalSales
] = useState<any[]>([]);

const [
  additionalSalesTotal,
  setAdditionalSalesTotal
] = useState(0);

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
    new Date(
      Date.now() -
      new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0]
  );

const [endDate,
  setEndDate] =
  useState(
    new Date(
      Date.now() -
      new Date().getTimezoneOffset() * 60000
    )
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
  clients(full_name, phone),
  services(name),
  workers(name),
  client_packages(
    internal_sale
  ),
  appointment_reserved_services(
    service_id,
    services(
      name,
      price
    )
  )
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

    const filteredAppointments =

  (data || []).filter(
    (appointment: any) =>

      appointment.client_packages?.internal_sale !== true
  );

  setTodayAppointments(
  filteredAppointments
);
    const sales =

   filteredAppointments.reduce(
    (sum, appointment) =>

      sum +

      Number(
        appointment.final_price || 0
      ),

    0
  );

const uniqueClients = [

  ...new Set(

   filteredAppointments.map(
      (appointment) =>
        appointment.clients?.full_name
    )

  )

];

setClientsToday(
  uniqueClients.length
);

const totalServices =

  filteredAppointments.reduce(
    (sum, appointment) =>

      sum +

      (
        appointment
          .appointment_reserved_services
          ?.length || 1
      ),

    0
  );

setServicesToday(
  totalServices
);

setTicketAverage(

  filteredAppointments.length

    ? sales /
      filteredAppointments.length

    : 0
);

const exportToExcel = () => {
const data = todayAppointments.map(
  (appointment) => ({
    Fecha: appointment.appointment_date,
    Hora: appointment.start_time,
    Cliente: appointment.clients?.full_name,
    Telefono: appointment.clients?.phone,
    Servicio:

  appointment
    .appointment_reserved_services
    ?.length > 0

    ? appointment
        .appointment_reserved_services
        .map(
          (item: any) =>
            item.services?.name
        )
        .join(" + ")

    : appointment.services?.name,
    Precio: appointment.final_price,
    Trabajadora: appointment.workers?.name
  })
);

  
  const worksheet =
    XLSX.utils.json_to_sheet(data);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Reporte"
  );

  XLSX.writeFile(
    workbook,
    `Reporte_${startDate}_${endDate}.xlsx`
  );
};

const dailySales: any = {};

filteredAppointments.forEach(
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


const serviceSales: any = {};
const serviceCounts: any = {};

filteredAppointments.forEach(
  (appointment) => {

  const reservedServices =

  appointment
    .appointment_reserved_services
    ?.length > 0

    ? appointment
        .appointment_reserved_services

    : [
        {
          services: {
            name: appointment.services?.name,
            price: appointment.final_price
          }
        }
      ];

    const totalListPrice =

      reservedServices.reduce(
        (sum: number, item: any) =>

          sum +

          Number(
            item.services?.price || 0
          ),

        0
      );

    reservedServices.forEach(
      (item: any) => {

        const serviceName =
          item.services?.name ||
          "Sin servicio";

        const servicePrice =
          Number(
            item.services?.price || 0
          );

        const proportionalAmount =

          totalListPrice > 0

            ? Math.round(

                (
                  servicePrice /
                  totalListPrice
                )

                *

                Number(
                  appointment.final_price || 0
                )

              )

            : 0;

        if (
          !serviceSales[
            serviceName
          ]
        ) {

          serviceSales[
            serviceName
          ] = 0;

        }

        if (
  !serviceCounts[
    serviceName
  ]
) {

  serviceCounts[
    serviceName
  ] = 0;

}

        serviceSales[
          serviceName
        ] += proportionalAmount;

        serviceCounts[
  serviceName
] += 1;

      }
    );

  }
);


setSalesByService(

  Object.entries(serviceSales).map(
    ([service, sales]) => ({

      service,

      sales,

      count:
        serviceCounts[
          service
        ] || 0

    })
  )

);

const clientsData: any = {};

filteredAppointments.forEach(
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

    console.log("allAppointments");
console.log(
  allAppointments?.[0]?.clients
);

const clientsLastVisit: any = {};

(allAppointments || []).forEach(
  (appointment) => {

    const client =
      (appointment.clients as any)?.full_name ||
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
        client.days >= 60
    )
    .sort(
      (a, b) =>
        b.days - a.days
    )

);

const {
  data: additionalSalesData
} = await supabase

  .from(
    "appointment_services"
  )

  .select(`
    appointment_id,
    sold_price,
    services(name),
    commission_amount,
    workers(name),
    appointments(
      appointment_date,
      clients(
        full_name
      )
    )
  `);

const filteredAdditionalSales =

  (additionalSalesData || [])
    .filter(
      (sale: any) => {

        const date =
          sale
            ?.appointments
            ?.appointment_date;

        return (

          date >= startDate &&

          date <= endDate

        );

      }
    );

   console.log(
  additionalSalesData?.[0]
);

const workerSales: any = {};

filteredAppointments.forEach(
  (appointment) => {

    const worker =
      appointment.workers?.name ||
      "Sin asignar";

    if (!workerSales[worker]) {

      workerSales[worker] = {
        ventas: 0,
        internas: 0
      };

    }

    workerSales[worker].ventas += Number(
      appointment.final_price || 0
    );

  }
);

(filteredAdditionalSales || []).forEach(
  (sale: any) => {

    const worker =
      sale?.workers?.name ||
      "Sin asignar";

    if (!workerSales[worker]) {

      workerSales[worker] = {
        ventas: 0,
        internas: 0
      };

    }

    workerSales[worker].internas += Number(
      sale.sold_price || 0
    );

  }
);

setSalesByWorker(

  Object.entries(workerSales).map(
    ([worker, values]: any) => ({
      worker,
      sales: values.ventas,
      internalSales: values.internas
    })
  )

);

const effectiveness: any = {};

// Clientes atendidos
filteredAppointments.forEach((appointment) => {

  const worker =
    appointment.workers?.name ||
    "Sin asignar";

  if (!effectiveness[worker]) {

   effectiveness[worker] = {
  attended: 0,
  appointments: new Set(),
  sales: 0
};
  }

  effectiveness[worker].attended++;

});

// Citas con venta adicional
(filteredAdditionalSales || []).forEach((sale: any) => {

  const worker =
    sale?.workers?.name ||
    "Sin asignar";

  const appointmentId =
    sale?.appointment_id;

  if (!effectiveness[worker]) {

    effectiveness[worker] = {
      attended: 0,
      appointments: new Set(),
    sales: 0
    };

  }

  if (appointmentId) {

    effectiveness[worker]
      .appointments
      .add(appointmentId);

      effectiveness[worker].sales +=
  Number(sale.sold_price || 0);

  }

});

setWorkerEffectiveness(

  Object.entries(effectiveness).map(
    ([worker, value]: any) => {

 const effectiveness =
  value.attended > 0
    ? Math.round(
        (value.appointments.size *
          value.sales) /
        value.attended
      )
    : 0;

return {

  worker,

  attended:
    value.attended,

  additional:
    value.appointments.size,

  sales:
    value.sales,

  effectiveness

};

    }
  )

);

setAdditionalSales(
  filteredAdditionalSales
);

setAdditionalSalesTotal(

  (filteredAdditionalSales || [])
    .reduce(
      (sum, sale: any) =>

        sum +
        Number(
          sale.sold_price || 0
        ),

      0
    )

);

const internalSalesTotal =

  (filteredAdditionalSales || [])
    .reduce(
      (sum, sale: any) =>

        sum +
        Number(
          sale.sold_price || 0
        ),

      0
    );

setSalesToday(
  sales
);
};

const exportToExcel = () => {

 const data = todayAppointments.map(
  (appointment) => ({
    Fecha: appointment.appointment_date,
    Hora: appointment.start_time,
    Cliente: appointment.clients?.full_name,
    Telefono: appointment.clients?.phone,
    Servicio:

  appointment
    .appointment_reserved_services
    ?.length > 0

    ? appointment
        .appointment_reserved_services
        .map(
          (item: any) =>
            item.services?.name
        )
        .join(" + ")

    : appointment.services?.name,
    Precio: appointment.final_price,
    Trabajadora: appointment.workers?.name
  })
);

const workbook =
  XLSX.utils.book_new();

const citasSheet =
  XLSX.utils.json_to_sheet(data);

XLSX.utils.book_append_sheet(
  workbook,
  citasSheet,
  "Citas"
);

const workersSheet =
  XLSX.utils.json_to_sheet(

    salesByWorker.map(
      (item) => ({
        Trabajadora: item.worker,
        Ventas: item.sales
      })
    )

  );

XLSX.utils.book_append_sheet(
  workbook,
  workersSheet,
  "Trabajadoras"
);

const servicesSheet =
  XLSX.utils.json_to_sheet(

    salesByService
      .sort(
        (a, b) =>
          b.sales - a.sales
      )
      .map((item) => ({

        Servicio:
          item.service,

        Cantidad:
          item.count,

        Ingresos:
          Math.round(item.sales)

      }))

  );

XLSX.utils.book_append_sheet(
  workbook,
  servicesSheet,
  "Servicios Más Vendidos"
);

const additionalSalesSheet =
  XLSX.utils.json_to_sheet(

    additionalSales.map(
      (sale: any) => ({

        Fecha:
          sale
            ?.appointments
            ?.appointment_date,

       Cliente:
  sale.appointments?.clients?.full_name || "",

        Servicio:
          sale
            ?.services
            ?.name,

        Trabajadora:
          sale
            ?.workers
            ?.name,

        Venta:
          sale.sold_price,

        Comision:
          sale.commission_amount || 0

      })
    )

  );

XLSX.utils.book_append_sheet(
  workbook,
  additionalSalesSheet,
  "Ventas Adicionales"
);

  XLSX.writeFile(
    workbook,
    `Reporte_${startDate}_${endDate}.xlsx`
  );

};

const maxEffectiveness =
  workerEffectiveness.length > 0
    ? Math.max(
        ...workerEffectiveness.map(
          (item) => item.effectiveness
        )
      )
    : 1;


  return (
    <div>
      <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold text-[#243847] mb-6 md:mb-8">
        Dashboard
      </h1>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">

  <div className="w-full lg:w-auto">
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

 <div className="w-full lg:w-auto">
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

  <button
  onClick={exportToExcel}
className="bg-green-600 text-white px-4 py-3 rounded-xl w-full lg:w-auto lg:self-end"
>
  📊 Exportar Excel
</button>

</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

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
        Teléfono
      </th>

      <th className="text-left p-3">
        Servicio
      </th>

      <th className="text-left p-3">
        Precio
      </th>

      <th className="text-left p-3">
        Trabajadora
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
  {appointment.appointment_date
    ?.split("-")
    .reverse()
    .join("/")}
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
              appointment.clients?.phone
            }

          </td>
<td className="p-3">

 {
  appointment
    .appointment_reserved_services
    ?.length > 0

    ? appointment
        .appointment_reserved_services
        .map(
          (item: any) =>
            item.services?.name
        )
        .join(" + ")

    : appointment.services?.name
}

</td>

<td className="p-3 font-semibold">

  S/ {
    Number(
      appointment.final_price || 0
    ).toFixed(2)
  }

</td>
          <td className="p-3">

            {
              appointment.workers?.name
      ?.split(" ")[0]
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

         {item.date
  ?.split("-")
  .reverse()
  .join("/")}

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

        <th className="text-left p-3">
        Ventas Internas
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
              {item.worker?.split(" ")[0]}
            </td>

            <td className="p-3 font-semibold">
              S/ {Number(item.sales).toFixed(2)}
            </td>

            <td className="p-3 font-semibold">
              S/ {Number(item.internalSales || 0).toFixed(2)}
            </td>

          </tr>

      ))}

    </tbody>

  </table>

</div>

<div className="bg-white rounded-3xl shadow mt-8 p-6">

  <h2 className="text-2xl font-bold text-[#243847] mb-4">
    Efectividad en Ventas Adicionales
  </h2>

  <table className="w-full">

    <thead>

      <tr>

        <th className="text-left p-3">
          Trabajadora
        </th>

        <th className="text-left p-3">
          Clientes Atendidos
        </th>

        <th className="text-left p-3">
          Clientes con Venta
        </th>

        <th className="text-left p-3">
        Venta Adicional
      </th>



        <th className="text-left p-3">
          Efectividad
        </th>

      </tr>

    </thead>

    <tbody>

      {workerEffectiveness
        .sort(
          (a, b) =>
            b.effectiveness -
            a.effectiveness
        )
        .map((item) => (

          <tr
            key={item.worker}
            className="border-t"
          >

            <td className="p-3">
              {item.worker?.split(" ")[0]}
            </td>

            <td className="p-3">
              {item.attended}
            </td>

            <td className="p-3">
              {item.additional}
            </td>

             <td className="p-3 font-semibold">
    S/ {Number(item.sales).toFixed(2)}
  </td>

            <td className="p-3 font-bold">

  <span
    className={`px-3 py-1 rounded-full text-white font-semibold ${
  item.effectiveness >=
  maxEffectiveness * 0.8
    ? "bg-green-600"
    : item.effectiveness >=
      maxEffectiveness * 0.5
    ? "bg-yellow-500"
    : "bg-red-600"
}`}
  >
    {item.effectiveness}
  </span>

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
          Cantidad
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

            <td className="p-3">
  {item.count}
</td>

<td className="p-3 font-semibold">
  S/ {Math.round(item.sales)}
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

<div className="bg-white rounded-3xl shadow mt-8 p-6">

  <h2 className="text-2xl font-bold text-[#243847] mb-4">
    ⭐ Ventas Adicionales
  </h2>

  <p className="mb-4 text-lg font-semibold">

    Total vendido:
    S/ {additionalSalesTotal}

  </p>

  <table className="w-full">

    <thead>

      <tr>

          <th className="text-left p-3">
          Fecha
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
          Venta
        </th>

      </tr>

    </thead>

    <tbody>

      {additionalSales.map(
        (sale: any, index) => (

          <tr
            key={index}
            className="border-t"
          >
            <td className="p-3">

  {
    sale
      ?.appointments
      ?.appointment_date
      ?.split("-")
      .reverse()
      .join("/")
  }

</td>

            <td className="p-3">

              {
                sale
                  ?.appointments
                  ?.clients
                  ?.full_name
              }

            </td>

            <td className="p-3">

              {
                sale
                  ?.services
                  ?.name
              }

            </td>

            <td className="p-3">

              {
                sale
                  ?.workers
                  ?.name
              }

            </td>

            <td className="p-3 font-semibold">

              S/ {sale.sold_price}

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