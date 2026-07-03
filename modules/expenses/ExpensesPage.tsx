"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Pencil,
  Trash2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Expense = {
  id: number;
  inventory_product_id: number | null;
  expense_date: string;
  category: string;
  description: string | null;
  amount: number;
  payment_method: string | null;
  quantity: number | null;
  supplier: string | null;
  receipt_number: string | null;
  created_at: string;
};

export default function ExpensesPage() {

  const [expenses,
    setExpenses] =
    useState<Expense[]>([]);

    const [inventoryCategories,
  setInventoryCategories] =
  useState<any[]>([]);

  const [editingId,
    setEditingId] =
    useState<number | null>(
      null
    );

const [expenseDate,
  setExpenseDate] =
  useState(
    new Date(
      Date.now() -
      new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0]
  );

  const [category,
    setCategory] =
    useState("");

  const [description,
    setDescription] =
    useState("");

  const [amount,
    setAmount] =
    useState("");

  const [paymentMethod,
    setPaymentMethod] =
    useState("");

  const [quantity,
    setQuantity] =
    useState("");

  const [supplier,
    setSupplier] =
    useState("");

  const [receiptNumber,
    setReceiptNumber] =
    useState("");

      const [inventoryCategoryId,
  setInventoryCategoryId] =
  useState("");

  const [search,
    setSearch] =
    useState("");

  const [filterCategory,
    setFilterCategory] =
    useState("");

  const [sortBy,
    setSortBy] =
    useState("date_desc");

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

  const fetchExpenses =
    async () => {

      const {
        data,
        error,
      } = await supabase

        .from("expenses")

        .select("*")

        .order(
          "expense_date",
          {
            ascending: false,
          }
        );

      if (error) {

        console.log(error);

        return;
      }

      setExpenses(
        data || []
      );
    };

    const fetchInventoryCategories =
  async () => {

    const {
      data,
      error
    } = await supabase

      .from(
        "inventory_categories"
      )

      .select(
        "id,name"
      )

      .order(
        "name"
      );

    if (error) return;

    setInventoryCategories(
      data || []
    );

  };

  useEffect(() => {

    fetchExpenses();

    fetchInventoryCategories();

  }, []);

  const saveExpense =
    async () => {

      if (
        !expenseDate ||
        !category ||
        !amount
      ) {

        alert(
          "Complete los campos obligatorios"
        );

        return;
      }

      const payload = {

        expense_date:
          expenseDate,

        category,

        description,

        amount:
          Number(amount),

        payment_method:
          paymentMethod || null,

        quantity:
          quantity
            ? Number(quantity)
            : null,

        supplier:
          supplier || null,

        receipt_number:
          receiptNumber || null,

      };

      let originalExpense: Expense | null = null;

if (editingId) {

  const { data } =
    await supabase

      .from("expenses")

      .select("*")

      .eq(
        "id",
        editingId
      )

      .single();

  originalExpense = data;

}

      if (editingId) {

        const { error } =
          await supabase

            .from(
              "expenses"
            )

            .update(
              payload
            )

            .eq(
              "id",
              editingId
            );

        if (error) {

          console.log(error);

          alert(
            "Error actualizando"
          );

          return;
        }


// Era Insumos y sigue siendo Insumos
if (

  originalExpense?.category?.trim() === "Insumos" &&

  category.trim() === "Insumos"

) {

  // Ya existe producto en inventario
  if (originalExpense?.inventory_product_id) {

    const { error: inventoryUpdateError } =
      await supabase

        .from(
          "inventory_products"
        )

        .update({

          name: description,

          category_id: Number(
            inventoryCategoryId
          ),

          measure:
            quantity || "",

          brand:
            supplier || ""

        })

        .eq(
          "id",
          originalExpense.inventory_product_id
        );

    if (inventoryUpdateError) {

      alert(
        inventoryUpdateError.message
      );

      return;

    }

  }

  // Es un gasto antiguo, todavía no tiene producto
  else {

    const {
      data: inventoryProduct,
      error: inventoryError
    } = await supabase

      .from(
        "inventory_products"
      )

      .insert({

        name:
          description,

        category_id:
          Number(
            inventoryCategoryId
          ),

        description:
          "",

        measure:
          quantity || "",

        stock_status:
          "Lleno",

        brand:
          supplier || "",

        active:
          true,

        notes:
          "Creado automáticamente desde Gastos",

        product_type:
          "cabina",

        stock:
          1

      })

      .select()

      .single();

    if (inventoryError) {

      alert(
        inventoryError.message
      );

      return;

    }

    await supabase

      .from(
        "expenses"
      )

      .update({

        inventory_product_id:
          inventoryProduct.id

      })

      .eq(
        "id",
        editingId
      );

  }

}

// Era Insumos y ahora ya no
if (

  originalExpense?.category?.trim() === "Insumos" &&

  category.trim() !== "Insumos"

){

  await supabase

    .from(
      "inventory_products"
    )

    .delete()

    .eq(
      "id",
      originalExpense?.inventory_product_id
    );

  await supabase

    .from(
      "expenses"
    )

    .update({

      inventory_product_id:
        null

    })

    .eq(
      "id",
      editingId
    );

}

// Antes no era Insumos y ahora sí
if (

  originalExpense?.category?.trim() !== "Insumos" &&

  category.trim() === "Insumos"

) {

  const {
    data: inventoryProduct
  } = await supabase

    .from(
      "inventory_products"
    )

    .insert({

      name:
        description,

      category_id:
        Number(
          inventoryCategoryId
        ),

      description:
        "",

      measure:
        quantity || "",

      stock_status:
        "Lleno",

      brand:
        supplier || "",

      active:
        true,

      notes:
        "Creado automáticamente desde Gastos",

      product_type:
        "cabina",

      stock:
        1

    })

    .select()

    .single();

  await supabase

    .from(
      "expenses"
    )

    .update({

      inventory_product_id:
        inventoryProduct.id

    })

    .eq(
      "id",
      editingId
    );

}

      } else {

        const {
            data: insertedExpense,
            error
          } = await supabase

            .from(
              "expenses"
            )

            .insert([
              payload
            ])

            .select()

            .single();

          if (error) {

            console.log(error);

            alert(
              "Error guardando"
            );

            return;
          }

          if (
  category === "Insumos"
) {

  const {
    data: inventoryProduct,
    error: inventoryError
  } = await supabase

    .from(
      "inventory_products"
    )

    .insert({

      name:
        description,

      category_id:
        Number(
          inventoryCategoryId
        ),

      description:
        "",

      measure:
        quantity || "",

      stock_status:
        "Lleno",

      brand:
        supplier || "",

      active:
        true,

      notes:
        "Creado automáticamente desde Gastos",

      product_type:
        "cabina",

      stock:
        1

    })

    .select()

    .single();

  if (
    inventoryError
  ) {

    console.log(
      inventoryError
    );

    alert(
      "Error creando producto en inventario"
    );

    return;

  }

  await supabase

    .from(
      "expenses"
    )

    .update({

      inventory_product_id:
        inventoryProduct.id

    })

    .eq(
      "id",
      insertedExpense.id
    );

}
      }

      setEditingId(null);

      setExpenseDate(
  new Date(
    Date.now() -
    new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0]
);
      setCategory("");

      setDescription("");

      setAmount("");

      setPaymentMethod("");

      setQuantity("");

      setSupplier("");

      setReceiptNumber("");

      fetchExpenses();
    };

 const deleteExpense =
  async (
    id: number
  ) => {

    const confirmDelete =
      confirm(
        "¿Eliminar gasto?"
      );

    if (!confirmDelete)
      return;

    const expense =
      expenses.find(
        (item) =>
          item.id === id
      );

    if (
      expense?.inventory_product_id
    ) {

      await supabase

        .from(
          "inventory_products"
        )

        .delete()

        .eq(
          "id",
          expense.inventory_product_id
        );

    }

    await supabase

      .from(
        "expenses"
      )

      .delete()

      .eq(
        "id",
        id
      );

    fetchExpenses();

  };

 const editExpense =
async (
  expense: Expense
) => {

      setEditingId(
        expense.id
      );

      setExpenseDate(
        expense.expense_date
      );

      setCategory(
        expense.category
      );

      setDescription(
        expense.description || ""
      );

      setAmount(
        String(
          expense.amount
        )
      );

      setPaymentMethod(
        expense.payment_method || ""
      );

      setQuantity(
        expense.quantity
          ? String(
              expense.quantity
            )
          : ""
      );

      setSupplier(
        expense.supplier || ""
      );

      setReceiptNumber(
        expense.receipt_number || ""
      );

      if (
  expense.inventory_product_id
) {

  const {
    data: inventoryProduct
  } = await supabase

    .from(
      "inventory_products"
    )

    .select(
      "category_id"
    )

    .eq(
      "id",
      expense.inventory_product_id
    )

    .single();

  setInventoryCategoryId(
    inventoryProduct?.category_id
      ?.toString() || ""
  );

} else {

  setInventoryCategoryId("");

}

      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      });
    };  const todayTotal =
    useMemo(() => {

     const today =
  new Date(
    Date.now() -
    new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

      return expenses

        .filter(
          (expense) =>
            expense.expense_date ===
            today
        )

        .reduce(
          (sum, expense) =>

            sum +
            Number(
              expense.amount
            ),

          0
        );

    }, [expenses]);

  const monthTotal =
  useMemo(() => {

const currentMonth =
  new Date(
    Date.now() -
    new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 7);

    return expenses

      .filter(
        (expense) =>

          expense.expense_date?.startsWith(
            currentMonth
          )
      )

      .reduce(
        (sum, expense) =>

          sum +
          Number(
            expense.amount
          ),

        0
      );

  }, [expenses]);
  const filteredExpenses =
    [...expenses]

      .filter(
        (expense) => {

          const matchesSearch =

            (
              expense.description ||
              ""
            )

              .toLowerCase()

              .includes(
                search.toLowerCase()
              );

          const matchesCategory =

            !filterCategory ||

            expense.category ===
              filterCategory;

              const matchesDate =

  expense.expense_date >= startDate &&

  expense.expense_date <= endDate;

          return (

            matchesSearch &&

            matchesCategory &&

            matchesDate

          );

        }
      )

      .sort((a, b) => {

        if (
          sortBy ===
          "amount_desc"
        ) {

          return (
            Number(
              b.amount
            ) -
            Number(
              a.amount
            )
          );
        }

        if (
          sortBy ===
          "amount_asc"
        ) {

          return (
            Number(
              a.amount
            ) -
            Number(
              b.amount
            )
          );
        }

        if (
          sortBy ===
          "date_asc"
        ) {

          return (
            new Date(
              a.expense_date
            ).getTime()

            -

            new Date(
              b.expense_date
            ).getTime()
          );
        }

        return (
          new Date(
            b.expense_date
          ).getTime()

          -

          new Date(
            a.expense_date
          ).getTime()
        );

      });

      const filteredTotal =
  filteredExpenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  );

  return (

    <div>

      <div className="mb-8">

        <h2 className="text-5xl font-bold text-[#243847]">

          Gastos 💸

        </h2>

        <p className="text-gray-600 mt-3 text-lg">

          Control de gastos del negocio

        </p>

      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-6 rounded-3xl shadow-xl">

          <p className="text-gray-500">

            Gastos Hoy

          </p>

          <h3 className="text-3xl font-bold text-red-500">

            S/
            {todayTotal.toFixed(2)}

          </h3>

        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl">

          <p className="text-gray-500">

            Gastos Mes

          </p>

          <h3 className="text-3xl font-bold text-orange-500">

            S/
            {monthTotal.toFixed(2)}

          </h3>

        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl">

          <p className="text-gray-500">

            Registros

          </p>

          <h3 className="text-3xl font-bold text-[#243847]">

            {expenses.length}

          </h3>

        </div>

      </div>      <div className="bg-white p-8 rounded-3xl shadow-xl mb-8">

        <h3 className="text-2xl font-bold text-[#243847] mb-6">

          {editingId
            ? "Editar gasto"
            : "Registrar gasto"}

        </h3>

        <div className="grid grid-cols-4 gap-4">

          <input
            type="date"
            value={expenseDate}
            onChange={(e) =>
              setExpenseDate(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl"
          />

          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl"
          >

            <option value="">
              Categoría
            </option>

            <option>
              Publicidad
            </option>

            <option>
              Insumos
            </option>

            <option>
              Limpieza
            </option>

            <option>
              Coffee Bar
            </option>

            <option>
              Alquiler
            </option>

            <option>
              Servicios Básicos
            </option>

            <option>
              Mantenimiento
            </option>

            <option>
              Equipos
            </option>

            <option>
              Impuestos
            </option>

            <option>
              Otros
            </option>

          </select>

          {category === "Insumos" && (

  <select
    value={inventoryCategoryId}
    onChange={(e) =>
      setInventoryCategoryId(
        e.target.value
      )
    }
    className="border p-4 rounded-2xl"
  >

    <option value="">
      Categoría inventario
    </option>

    {inventoryCategories.map(
      (item) => (

        <option
          key={item.id}
          value={item.id}
        >
          {item.name}
        </option>

      )
    )}

  </select>

)}

          <input
            type="text"
            placeholder="Descripción"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl"
          />

          <input
            type="number"
            placeholder="Monto"
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl"
          />

          <input
            type="number"
            placeholder="Cantidad"
            value={quantity}
            onChange={(e) =>
              setQuantity(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl"
          />

          <input
            type="text"
            placeholder="Proveedor"
            value={supplier}
            onChange={(e) =>
              setSupplier(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl"
          />

          <input
            type="text"
            placeholder="N° Comprobante"
            value={receiptNumber}
            onChange={(e) =>
              setReceiptNumber(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl"
          />

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl"
          >

            <option value="">
              Método de pago
            </option>

            <option>
              Efectivo
            </option>

            <option>
              Yape
            </option>

            <option>
              Plin
            </option>

            <option>
              Transferencia
            </option>

            <option>
              Tarjeta
            </option>

          </select>

        </div>

        <button
          onClick={saveExpense}
          className="mt-6 bg-[#243847] text-white px-6 py-3 rounded-2xl"
        >

          {editingId
            ? "Actualizar gasto"
            : "Guardar gasto"}

        </button>

      </div>

      <div className="flex gap-4 mb-6">

        <input
  type="date"
  value={startDate}
  onChange={(e) =>
    setStartDate(
      e.target.value
    )
  }
  className="border p-4 rounded-2xl"
/>

<input
  type="date"
  value={endDate}
  onChange={(e) =>
    setEndDate(
      e.target.value
    )
  }
  className="border p-4 rounded-2xl"
/>

        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border p-4 rounded-2xl w-[350px]"
        />

        <select
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(
              e.target.value
            )
          }
          className="border p-4 rounded-2xl"
        >

          <option value="">
            Todas las categorías
          </option>

          <option>
            Publicidad
          </option>

          <option>
            Insumos
          </option>

          <option>
            Limpieza
          </option>

           <option>
            Coffee Bar
          </option>

          <option>
            Alquiler
          </option>

          <option>
            Servicios Básicos
          </option>

          <option>
            Mantenimiento
          </option>

          <option>
            Equipos
          </option>

          <option>
            Impuestos
          </option>

          <option>
            Otros
          </option>

        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value
            )
          }
          className="border p-4 rounded-2xl"
        >

          <option value="date_desc">
            Fecha reciente
          </option>

          <option value="date_asc">
            Fecha antigua
          </option>

          <option value="amount_desc">
            Mayor monto
          </option>

          <option value="amount_asc">
            Menor monto
          </option>

        </select>
<div className="ml-auto bg-red-50 border border-red-200 rounded-2xl px-6 py-3">

  <p className="text-sm text-gray-500">
    Total filtrado
  </p>

  <p className="text-2xl font-bold text-red-600">
    S/ {filteredTotal.toFixed(2)}
  </p>

</div>
      </div>      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-[#dbe8ee]">

            <tr>

              <th className="text-left p-5">
                Fecha
              </th>

              <th className="text-left p-5">
                Categoría
              </th>

              <th className="text-left p-5">
                Descripción
              </th>

              <th className="text-left p-5">
                Cantidad
              </th>

              <th className="text-left p-5">
                Proveedor
              </th>

              <th className="text-left p-5">
                Comprobante
              </th>

              <th className="text-left p-5">
                Pago
              </th>

              <th className="text-left p-5">
                Monto
              </th>

              <th className="text-left p-5">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredExpenses.map(
              (expense) => (

                <tr
                  key={expense.id}
                  className="border-t"
                >

                  <td className="p-5">

                    {
                      expense.expense_date
                    }

                  </td>

                  <td className="p-5">

                    <span className="bg-gray-100 px-3 py-1 rounded-xl text-sm">

                      {
                        expense.category
                      }

                    </span>

                  </td>

                  <td className="p-5">

                    {
                      expense.description
                    }

                  </td>

                  <td className="p-5">

                    {
                      expense.quantity || "-"
                    }

                  </td>

                  <td className="p-5">

                    {
                      expense.supplier || "-"
                    }

                  </td>

                  <td className="p-5">

                    {
                      expense.receipt_number || "-"
                    }

                  </td>

                  <td className="p-5">

                    {
                      expense.payment_method || "-"
                    }

                  </td>

                  <td className="p-5 font-bold text-red-500">

                    S/
                    {
                      Number(
                        expense.amount
                      ).toFixed(2)
                    }

                  </td>

                  <td className="p-5">

                    <div className="flex gap-3">

                      <button
                        onClick={() =>
                          editExpense(
                            expense
                          )
                        }
                        className="bg-blue-100 p-3 rounded-xl hover:scale-105 transition"
                      >

                        <Pencil
                          size={18}
                        />

                      </button>

                      <button
                        onClick={() =>
                          deleteExpense(
                            expense.id
                          )
                        }
                        className="bg-red-100 p-3 rounded-xl hover:scale-105 transition"
                      >

                        <Trash2
                          size={18}
                        />

                      </button>

                    </div>

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