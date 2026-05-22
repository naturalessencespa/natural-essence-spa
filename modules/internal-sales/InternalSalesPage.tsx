"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "@/lib/supabase";

export default function InternalSalesPage() {

  const [
    sales,
    setSales
  ] = useState<any[]>([]);

  const [
  editingSaleId,
  setEditingSaleId
] = useState<number | null>(null);

const [
  editSoldPrice,
  setEditSoldPrice
] = useState("");

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
              ascending:
                false,
            }
          );

      if (error) {

        console.log(error);

        return;
      }

      setSales(
        data || []
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
      sold * 0.20;

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

  useEffect(() => {

    fetchSales();

  }, []);

  return (

    <div>

      <div className="mb-8">

        <h2 className="text-5xl font-bold text-[#243847]">

          Ventas Internas 💎

        </h2>

        <p className="text-gray-600 mt-3 text-lg">

          Ventas adicionales realizadas por trabajadoras

        </p>

      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <table className="w-full">

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

        className="border p-2 rounded-xl w-[120px]"

      />

      <p className="text-sm text-green-600 mt-2 font-medium">

        Comisión:
        S/
        {(
          Number(
            editSoldPrice || 0
          ) * 0.20
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

    className="bg-green-600 text-white px-4 py-2 rounded-xl mr-2"

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

    className="bg-orange-500 text-white px-4 py-2 rounded-xl mr-2"

  >

    Editar

  </button>

)}

                    <button

                        onClick={() =>
                        deleteSale(sale.id)
                        }

                        className="bg-red-500 text-white px-4 py-2 rounded-xl"

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