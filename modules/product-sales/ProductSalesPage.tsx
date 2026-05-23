"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "@/lib/supabase";

export default function ProductSalesPage() {

  const [
    sales,
    setSales
  ] = useState<any[]>([]);

  const [
  showModal,
  setShowModal
] = useState(false);

const [
  products,
  setProducts
] = useState<any[]>([]);

const [
  workers,
  setWorkers
] = useState<any[]>([]);

const [
  clients,
  setClients
] = useState<any[]>([]);

const [
  productId,
  setProductId
] = useState("");

const [
  workerId,
  setWorkerId
] = useState("");

const [
  clientId,
  setClientId
] = useState("");

const [
  quantity,
  setQuantity
] = useState("1");

const [
  unitPrice,
  setUnitPrice
] = useState("");

const [
  saleOrigin,
  setSaleOrigin
] = useState("mostrador");

const [
  saleDate,
  setSaleDate
] = useState(
  new Date()
    .toISOString()
    .split("T")[0]
);

const [
  productFilter,
  setProductFilter
] = useState("");

const [
  workerFilter,
  setWorkerFilter
] = useState("");

const [
  fromDate,
  setFromDate
] = useState("");

const [
  toDate,
  setToDate
] = useState("");

  const fetchSales =
    async () => {

      const {
        data,
        error
      } =
        await supabase

          .from(
            "product_sales"
          )

          .select(`
            *,
            inventory_products(name),
            workers(name),
            clients(full_name)
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

      let filteredSales =
  data || [];

// PRODUCTO
if (productFilter) {

  filteredSales =
    filteredSales.filter(
      (sale) =>

        sale
          .inventory_products
          ?.name

          ?.toLowerCase()

          .includes(
            productFilter.toLowerCase()
          )
    );
}

// TRABAJADORA
if (workerFilter) {

  filteredSales =
    filteredSales.filter(
      (sale) =>

        sale
          .workers
          ?.name

          ?.toLowerCase()

          .includes(
            workerFilter.toLowerCase()
          )
    );
}

// DESDE
if (fromDate) {

  filteredSales =
    filteredSales.filter(
      (sale) =>

        sale.created_at
  ?.split("T")[0]

  >= fromDate
    );
}

// HASTA
if (toDate) {

  filteredSales =
    filteredSales.filter(
      (sale) =>

        sale.created_at
  ?.split("T")[0]

  <= toDate
    );
}

setSales(
  filteredSales
);
    };


    const fetchFormData =
  async () => {

    const {
      data: productsData
    } =
      await supabase

        .from(
  "inventory_products"
)

.select("*")

.in(
  "product_type",
  [
    "venta",
    "mixto"
  ]
)

        .eq(
          "active",
          true
        );

    const {
      data: workersData
    } =
      await supabase

        .from(
          "workers"
        )

        .select("*")

        .eq(
          "active",
          true
        );

    const {
      data: clientsData
    } =
      await supabase

        .from(
          "clients"
        )

        .select("*")

        .eq(
          "active",
          true
        );

    setProducts(
      productsData || []
    );

    setWorkers(
      workersData || []
    );

    setClients(
      clientsData || []
    );
  };
  const saveProductSale =
  async () => {

    if (
      !productId ||
      !workerId ||
      !quantity ||
      !unitPrice
    ) {

      alert(
        "Completa los campos"
      );

      return;
    }

    const qty =
      Number(quantity);

    const total =
      qty *
  Number(unitPrice);

    const commission =
      total * 0.15;

    const { error } =
      await supabase

        .from(
          "product_sales"
        )

        .insert([
          {

            product_id:
              Number(productId),

            worker_id:
              Number(workerId),

            client_id:
              clientId
                ? Number(clientId)
                : null,

            quantity:
              qty,

            unit_price:
              total / qty,

            total:
              total,

            commission_percentage:
              15,

            commission_amount:
              commission,

            sale_origin:
              saleOrigin,

              created_at:
  saleDate,

              

          },
        ]);

    if (error) {

      console.log(error);

      alert(
        "Error guardando venta"
      );

      return;
    }

    // OBTENER STOCK ACTUAL
const {
  data: currentProduct
} = await supabase

  .from(
    "inventory_products"
  )

  .select("stock")

  .eq(
    "id",
    Number(productId)
  )

  .single();

// NUEVO STOCK
const newStock =
  Number(
    currentProduct?.stock || 0
  ) - qty;

  if (newStock < 0) {

  alert(
    "Stock insuficiente"
  );

  return;
}

// ACTUALIZAR STOCK
await supabase

  .from(
    "inventory_products"
  )

  .update({
    stock: newStock
  })

  .eq(
    "id",
    Number(productId)
  );

// MOVIMIENTO INVENTARIO
await supabase

  .from(
    "inventory_movements"
  )

  .insert([
    {

      product_id:
        Number(productId),

      movement_type:
        "venta",

      quantity:
        qty,

      previous_stock:
        currentProduct?.stock || 0,

      new_stock:
        newStock,

      notes:
        "Venta producto",

      movement_date:
        saleDate

    },
  ]);
    alert(
      "Venta guardada"
    );

    setShowModal(false);

    setProductId("");

    setWorkerId("");

    setClientId("");

    setQuantity("1");

    setUnitPrice("");

    setSaleOrigin(
      "mostrador"
    );

    fetchSales();

  };

useEffect(() => {

  fetchSales();

  fetchFormData();

}, [
  productFilter,
  workerFilter,
  fromDate,
  toDate
]);



  return (

    <div>

      <div className="mb-8">

        <h2 className="text-5xl font-bold text-[#243847]">

          Ventas Productos 🧴

        </h2>

        <p className="text-gray-600 mt-3 text-lg">

          Ventas de productos realizadas en cabina y mostrador

        </p>

                 <button

  onClick={() =>
    setShowModal(true)
  }

  className="bg-[#243847] text-white px-5 py-3 rounded-2xl mt-6"

>

  + Nueva Venta

</button>

      </div>

      <div className="flex gap-4 mb-6 flex-wrap">

  {/* PRODUCTO */}
  <input

    type="text"

    placeholder="Filtrar producto..."

    value={productFilter}

    onChange={(e) =>
      setProductFilter(
        e.target.value
      )
    }

    className="border p-4 rounded-2xl"

  />

  {/* TRABAJADORA */}
  <input

    type="text"

    placeholder="Filtrar trabajadora..."

    value={workerFilter}

    onChange={(e) =>
      setWorkerFilter(
        e.target.value
      )
    }

    className="border p-4 rounded-2xl"

  />

  {/* DESDE */}
  <input

    type="date"

    value={fromDate}

    onChange={(e) =>
      setFromDate(
        e.target.value
      )
    }

    className="border p-4 rounded-2xl"

  />

  {/* HASTA */}
  <input

    type="date"

    value={toDate}

    onChange={(e) =>
      setToDate(
        e.target.value
      )
    }

    className="border p-4 rounded-2xl"

  />

</div>

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
                Cliente
              </th>

              <th className="p-4 text-left">
                Trabajadora
              </th>

              <th className="p-4 text-left">
                Cantidad
              </th>

              <th className="p-4 text-left">
                Total
              </th>

              <th className="p-4 text-left">
                Comisión
              </th>

              <th className="p-4 text-left">
                Origen
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
                      new Date(
                        sale.created_at
                      ).toLocaleDateString()
                    }

                  </td>

                  <td className="p-4">

                    {
                      sale
                        .inventory_products
                        ?.name
                    }

                  </td>

                  <td className="p-4">

                    {
                      sale
                        .clients
                        ?.full_name ||
                      "-"
                    }

                  </td>

                  <td className="p-4">

                    {
                      sale
                        .workers
                        ?.name ||
                      "-"
                    }

                  </td>

                  <td className="p-4">

                    {
                      sale.quantity
                    }

                  </td>

                  <td className="p-4">

                    S/
                    {
                      sale.total
                    }

                  </td>

                  <td className="p-4">

                    S/
                    {
                      sale
                        .commission_amount
                    }

                  </td>

                  <td className="p-4 capitalize">

                    {
                      sale.sale_origin
                    }

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

      {showModal && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white p-8 rounded-3xl w-[500px] shadow-2xl">

      <h3 className="text-2xl font-bold text-[#243847] mb-6">

        Nueva Venta Producto

      </h3>

      <div className="space-y-4">

        {/* PRODUCTO */}
        <select

          value={productId}

          onChange={(e) =>
            setProductId(
              e.target.value
            )
          }

          className="w-full border p-4 rounded-2xl"

        >

          <option value="">
            Seleccionar producto
          </option>

          {products.map((product) => (

            <option
              key={product.id}
              value={product.id}
            >

              {product.name}

            </option>

          ))}

        </select>

        {/* CLIENTE */}
        <select

          value={clientId}

          onChange={(e) =>
            setClientId(
              e.target.value
            )
          }

          className="w-full border p-4 rounded-2xl"

        >

          <option value="">
            Cliente opcional
          </option>

          {clients.map((client) => (

            <option
              key={client.id}
              value={client.id}
            >

              {client.full_name}

            </option>

          ))}

        </select>

        {/* TRABAJADORA */}
        <select

          value={workerId}

          onChange={(e) =>
            setWorkerId(
              e.target.value
            )
          }

          className="w-full border p-4 rounded-2xl"

        >

          <option value="">
            Seleccionar trabajadora
          </option>

          {workers.map((worker) => (

            <option
              key={worker.id}
              value={worker.id}
            >

              {worker.name}

            </option>

          ))}

        </select>

        {/* CANTIDAD */}
        <input

          type="number"

          placeholder="Cantidad"

          value={quantity}

          onChange={(e) =>
            setQuantity(
              e.target.value
            )
          }

          className="w-full border p-4 rounded-2xl"

        />

        {/* PRECIO */}
        <input

          type="number"

          placeholder="Precio total"

          value={unitPrice}

          onChange={(e) =>
            setUnitPrice(
              e.target.value
            )
          }

          className="w-full border p-4 rounded-2xl"

        />

            {/* FECHA */}
<input

  type="date"

  value={saleDate}

  onChange={(e) =>
    setSaleDate(
      e.target.value
    )
  }

  className="w-full border p-4 rounded-2xl"

/>

        {/* ORIGEN */}
        <select

          value={saleOrigin}

          onChange={(e) =>
            setSaleOrigin(
              e.target.value
            )
          }

          className="w-full border p-4 rounded-2xl"

        >

          <option value="mostrador">
            Mostrador
          </option>

          <option value="cabina">
            Cabina
          </option>

        </select>

        <p className="text-green-600 font-medium">

          Comisión:
          S/
          {
            (
              (
                Number(quantity || 0)
                *
                Number(unitPrice || 0)
              ) * 0.15
            ).toFixed(2)
          }

        </p>

      </div>

      <div className="flex gap-4 mt-8">

        <button

          onClick={() =>
            setShowModal(false)
          }

          className="bg-gray-200 px-5 py-3 rounded-2xl"

        >

          Cancelar

        </button>

        <button

          onClick={
  saveProductSale
}

          className="bg-[#243847] text-white px-5 py-3 rounded-2xl"

        >

          Guardar Venta

        </button>

      </div>

    </div>

  </div>

)}

    </div>

  );
}