"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "@/lib/supabase";

type Props = {
  selectedBranch: number;
};

export default function InventoryMovementsPage({
  selectedBranch,
}: Props) {

  const [
    movements,
    setMovements
  ] = useState<any[]>([]);

  const [
  productFilter,
  setProductFilter
] = useState("");

  const fetchMovements =
    async () => {

      const {
        data,
        error
      } =
        await supabase

          .from(
            "inventory_movements"
          )

          .select(`
            *,
            inventory_products(name)
          `)

          .order(
                "id",
                {
                    ascending:
                    false,
                }
                );

      if (error) {

        console.log(error);

        return;
      }

     let filteredMovements =
  data || [];

if (productFilter) {

  filteredMovements =
    filteredMovements.filter(
      (movement) =>

        movement
          .inventory_products
          ?.name

          ?.toLowerCase()

          .includes(
            productFilter.toLowerCase()
          )
    );
}

setMovements(
  filteredMovements
);
    };

  useEffect(() => {

    fetchMovements();

    }, [productFilter]);

  return (

    <div>

      <div className="mb-8">

        <h2 className="text-5xl font-bold text-[#243847]">

          Movimientos Inventario 📦

        </h2>

        <p className="text-gray-600 mt-3 text-lg">

          Historial de ingresos y salidas de stock

        </p>

      </div>

      <input

  type="text"

  placeholder="Filtrar producto..."

  value={productFilter}

  onChange={(e) =>
    setProductFilter(
      e.target.value
    )
  }

  className="border p-4 rounded-2xl mb-6 w-[320px]"

/>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-[#243847] text-white">

            <tr>

              <th className="p-4 text-left">
                Fecha
              </th>

              <th className="p-4 text-left">
                Producto
              </th>

              <th className="p-4 text-left">
                Tipo
              </th>

              <th className="p-4 text-left">
                Cantidad
              </th>

              <th className="p-4 text-left">
                Antes
              </th>

              <th className="p-4 text-left">
                Después
              </th>

              <th className="p-4 text-left">
                Nota
              </th>

            </tr>

          </thead>

          <tbody>

            {movements.map(
              (movement) => (

                <tr
                  key={movement.id}
                  className="border-b"
                >

                  <td className="p-4">

                    {
                    movement.movement_date
                        ||
                      new Date(
                        movement.created_at
                      ).toLocaleDateString()
                    }

                  </td>

                  <td className="p-4">

                    {
                      movement
                        .inventory_products
                        ?.name
                    }

                  </td>

                  <td className="p-4 capitalize">

                    {
                      movement
                        .movement_type
                    }

                  </td>

                  <td className="p-4">

                    {
                      movement
                        .quantity
                    }

                  </td>

                  <td className="p-4">

                    {
                      movement
                        .previous_stock
                    }

                  </td>

                  <td className="p-4">

                    {
                      movement
                        .new_stock
                    }

                  </td>

                  <td className="p-4">

                    {
                      movement
                        .notes
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