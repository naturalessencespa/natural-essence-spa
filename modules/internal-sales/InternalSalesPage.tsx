"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "@/lib/supabase";

import * as XLSX from "xlsx";

type Props = {
  selectedBranch: number;
};

export default function InternalSalesPage({
  selectedBranch,
}: Props) {

  const [
    sales,
    setSales
  ] = useState<any[]>([]);

  const [
  startDate,
  setStartDate
] = useState(
  new Date(
    Date.now() -
    new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0]
);

const [
  endDate,
  setEndDate
] = useState(
  new Date(
    Date.now() -
    new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0]
);

const [
  workerFilter,
  setWorkerFilter
] = useState("");

const [
  serviceFilter,
  setServiceFilter
] = useState("");

const [
  clientFilter,
  setClientFilter
] = useState("");

const [
  totalSold,
  setTotalSold
] = useState(0);

const [
  totalCommission,
  setTotalCommission
] = useState(0);

const [
  workers,
  setWorkers
] = useState<any[]>([]);

const [
  services,
  setServices
] = useState<any[]>([]);

const [
  commissionPercentage,
  setCommissionPercentage
] = useState(20);

  const [
  editingSaleId,
  setEditingSaleId
] = useState<number | null>(null);

const [
  editSoldPrice,
  setEditSoldPrice
] = useState("");

const loadCommission =
  async () => {

    const { data } =
      await supabase

        .from("system_settings")

        .select("setting_value")

        .eq(
          "branch_id",
          selectedBranch
        )

        .eq(
          "category",
          "commission"
        )

        .eq(
          "setting_key",
          "additional_sale"
        )

        .maybeSingle();

    setCommissionPercentage(
      Number(
        data?.setting_value ?? 20
      )
    );

  };

  const fetchSales =
    async () => {

      const {
  data,
  error
} =
  await supabase

    .from(
      "appointment_services"
    )

    .select(`
      *,
      services(name),
      workers(name),
      appointments(
        appointment_date,
        clients(full_name)
      )
    `)

    .order(
      "created_at",
      {
        ascending: false,
      }
    );
      if (error) {

        console.log(error);

        return;
      }

const filteredSales =

  (data || []).filter(
    (sale: any) => {

      const worker =
        sale.workers?.name || "";

      const service =
        sale.services?.name || "";

      const client =
        sale.appointments?.clients?.full_name || "";

      const date =
        sale.appointments?.appointment_date || "";

      const matchDate =
        date >= startDate &&
        date <= endDate;

      const matchWorker =
        worker
          .toLowerCase()
          .includes(
            workerFilter.toLowerCase()
          );

      const matchService =
        service
          .toLowerCase()
          .includes(
            serviceFilter.toLowerCase()
          );

      const matchClient =
        client
          .toLowerCase()
          .includes(
            clientFilter.toLowerCase()
          );

      return (
        matchDate &&
        matchWorker &&
        matchService &&
        matchClient
      );

    }
  );
     setSales(
  filteredSales
);

setTotalSold(

  filteredSales.reduce(
    (sum: number, sale: any) =>

      sum +
      Number(
        sale.sold_price || 0
      ),

    0
  )

);

setTotalCommission(

  filteredSales.reduce(
    (sum: number, sale: any) =>

      sum +
      Number(
        sale.commission_amount || 0
      ),

    0
  )

);
    };

    const deleteSale =
  async (
    saleId: number
  ) => {

    const confirmDelete =
      confirm(
        "¿Eliminar venta interna?"
      );

    if (!confirmDelete)
      return;

    const { error } =
      await supabase

        .from(
          "appointment_services"
        )

        .delete()

        .eq(
          "id",
          saleId
        );

    if (error) {

      console.log(error);

      alert(
        "Error eliminando venta"
      );

      return;
    }

    alert(
      "Venta eliminada"
    );

    fetchSales();
  };

  const updateSale =
  async (
    saleId: number
  ) => {

    const sold =
      parseFloat(
        editSoldPrice
      );

  const commission =
  sold *
  (commissionPercentage / 100);

    const { error } =
      await supabase

        .from(
          "appointment_services"
        )

        .update({

          sold_price:
            sold,

          commission_amount:
            commission,

        })

        .eq(
          "id",
          saleId
        );

    if (error) {

      console.log(error);

      alert(
        "Error actualizando venta"
      );

      return;
    }

    alert(
      "Venta actualizada"
    );

    setEditingSaleId(null);

    setEditSoldPrice("");

    fetchSales();
  };

  const exportToExcel = () => {

  const data = sales.map(
    (sale) => ({

      Fecha:
        sale.appointments?.appointment_date,

      Cliente:
        sale.appointments?.clients?.full_name,

      Servicio:
        sale.services?.name,

      Trabajadora:
        sale.workers?.name,

      Precio:
        sale.sold_price,

      Comisión:
        sale.commission_amount

    })
  );

  const worksheet =
    XLSX.utils.json_to_sheet(data);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Ventas Internas"
  );

  XLSX.writeFile(
    workbook,
    `Ventas_Internas_${startDate}_${endDate}.xlsx`
  );

};

useEffect(() => {

  loadCommission();

  fetchSales();

}, [
  startDate,
  endDate,
  workerFilter,
  serviceFilter,
  clientFilter
]);

  return (

    <div>

      <div className="mb-8">

        <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-[#243847]">

          Ventas Internas 💎

        </h2>

        <p className="text-gray-600 mt-3 text-lg">

          Ventas adicionales realizadas por trabajadoras

        </p>

        <div className="mt-5">

  <button

    onClick={exportToExcel}

className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold"

  >

    📊 Exportar Excel

  </button>

</div>

      </div>

    <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6 mb-6">

 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">

    <input
      type="date"
      value={startDate}
      onChange={(e) =>
        setStartDate(
          e.target.value
        )
      }
     className="w-full border rounded-xl p-3"
    />

    <input
      type="date"
      value={endDate}
      onChange={(e) =>
        setEndDate(
          e.target.value
        )
      }
     className="w-full border rounded-xl p-3"
    />

    <input
      type="text"
      placeholder="Trabajadora"
      value={workerFilter}
      onChange={(e) =>
        setWorkerFilter(
          e.target.value
        )
      }
    className="w-full border rounded-xl p-3"
    />

    <input
      type="text"
      placeholder="Servicio"
      value={serviceFilter}
      onChange={(e) =>
        setServiceFilter(
          e.target.value
        )
      }
     className="w-full border rounded-xl p-3"
    />

    <input
      type="text"
      placeholder="Cliente"
      value={clientFilter}
      onChange={(e) =>
        setClientFilter(
          e.target.value
        )
      }
   className="w-full border rounded-xl p-3"
    />

    <div className="flex flex-col justify-center rounded-xl bg-gray-50 p-3">

      <span className="font-semibold">

        Total:
        S/{totalSold.toFixed(2)}

      </span>

      <span className="text-green-600 font-semibold">

        Comisión:
        S/{totalCommission.toFixed(2)}

      </span>

    </div>

  </div>

</div>

      <div className="bg-white rounded-3xl shadow-xl overflow-x-auto">

       <table className="min-w-[1050px] w-full">

          <thead className="bg-[#243847] text-white">

            <tr>

              <th className="p-4 text-left">
                Fecha
              </th>

              <th className="p-4 text-left">
                Cliente
              </th>

              <th className="p-4 text-left">
                Servicio
              </th>

              <th className="p-4 text-left">
                Trabajadora
              </th>

              <th className="p-4 text-left">
                Precio vendido
              </th>

              <th className="p-4 text-left">
                Comisión
              </th>

              <th className="p-4 text-left">
                Acciones
                </th>

            </tr>

          </thead>

          <tbody>

            {sales.map(
              (sale) => (

                <tr
                  key={sale.id}
                  className="border-b"
                >

                  <td className="p-4">

                    {
                      sale
                        .appointments
                        ?.appointment_date
                    }

                  </td>

                  <td className="p-4">

                    {
                      sale
                        .appointments
                        ?.clients
                        ?.full_name
                    }

                  </td>

                  <td className="p-4">

                    {
                      sale
                        .services
                        ?.name
                    }

                  </td>

                  <td className="p-4">

                    {
                      sale
                        .workers
                        ?.name
                    }

                  </td>

<td className="p-4">

  {editingSaleId ===
  sale.id ? (

    <div>

      <input

        type="number"

        value={editSoldPrice}

        onChange={(e) =>
          setEditSoldPrice(
            e.target.value
          )
        }

       className="border p-2 rounded-xl w-full md:w-[120px]"

      />

      <p className="text-sm text-green-600 mt-2 font-medium">

        Comisión:
        S/
        {(
         (Number(
  editSoldPrice || 0
) *
(commissionPercentage / 100))
        ).toFixed(2)}

      </p>

    </div>

  ) : (

    <>S/{sale.sold_price}</>

  )}

</td>

                  <td className="p-4">

                    S/
                    {
                      sale
                        .commission_amount
                    }

                  </td>

                  <td className="p-4">

                    {editingSaleId ===
sale.id ? (

  <button

    onClick={() =>
      updateSale(sale.id)
    }

    className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-xl mb-2 md:mb-0 md:mr-2"

  >

    Guardar

  </button>

) : (

  <button

    onClick={() => {

      setEditingSaleId(
        sale.id
      );

      setEditSoldPrice(
        sale.sold_price
          ?.toString()
      );

    }}

    className="w-full md:w-auto bg-orange-500 text-white px-4 py-2 rounded-xl mb-2 md:mb-0 md:mr-2"

  >

    Editar

  </button>

)}

                    <button

                        onClick={() =>
                        deleteSale(sale.id)
                        }

                        className="w-full md:w-auto bg-red-500 text-white px-4 py-2 rounded-xl"

                    >

                        Eliminar

                    </button>

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