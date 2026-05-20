"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function InventoryPage() {

  const [products, setProducts] =
    useState<any[]>([]);

  const [categories, setCategories] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [filterCategory,
    setFilterCategory] =
    useState("");

  const [sortBy, setSortBy] =
    useState("name");

  const [showModal, setShowModal] =
    useState(false);

  const [editingProductId,
    setEditingProductId] =
    useState<number | null>(null);

  const [name, setName] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [measure, setMeasure] =
    useState("");

  const [stockStatus, setStockStatus] =
    useState("");

  const [brand, setBrand] =
    useState("");

  const [expirationDate,
    setExpirationDate] =
    useState("");

  const [notes, setNotes] =
    useState("");

  // OBTENER PRODUCTOS
  const fetchProducts = async () => {

    const { data, error } =
      await supabase

        .from("inventory_products")

        .select(`
          *,
          inventory_categories(name)
        `)

        .eq("active", true)

        .order("id", {
          ascending: false,
        });

    if (error) {

      console.log(error);

      return;
    }

    let filteredProducts =
      data || [];

    // BUSCAR PRODUCTO
    if (search) {

      filteredProducts =
        filteredProducts.filter(
          (product) =>

            product.name
              ?.toLowerCase()

              .includes(
                search.toLowerCase()
              )
        );
    }

    // FILTRAR CATEGORIA
    if (filterCategory) {

      filteredProducts =
        filteredProducts.filter(
          (product) =>

            product.category_id
              ?.toString()

              === filterCategory
        );
    }

    // ORDENAR
    filteredProducts.sort((a, b) => {

      // NOMBRE
      if (sortBy === "name") {

        return a.name.localeCompare(
          b.name
        );
      }

      // ESTADO
      if (sortBy === "stock") {

        return (
          a.stock_status || ""
        ).localeCompare(
          b.stock_status || ""
        );
      }

      return 0;
    });

    setProducts(filteredProducts);
  };

  // OBTENER CATEGORIAS
  const fetchCategories = async () => {

    const { data, error } =
      await supabase

        .from("inventory_categories")

        .select("*")

        .eq("active", true)

        .order("name");

    if (error) {

      console.log(error);

      return;
    }

    setCategories(data || []);
  };

  // GUARDAR / EDITAR
  const saveProduct = async () => {

    if (
      !name ||
      !categoryId
    ) {

      alert(
        "Completa nombre y categoría"
      );

      return;
    }

    // EDITAR
    if (editingProductId) {

      const { error } =
        await supabase

          .from("inventory_products")

          .update({

            name,

            category_id:
              parseInt(categoryId),

            description,

            measure,

            stock_status:
              stockStatus,

            brand,

            expiration_date:
              expirationDate || null,

            notes,

          })

          .eq(
            "id",
            editingProductId
          );

      if (error) {

        console.log(error);

        alert(
          "Error al actualizar"
        );

        return;
      }

      alert(
        "Producto actualizado"
      );

    } else {

      // CREAR
      const { error } =
        await supabase

          .from("inventory_products")

          .insert([
            {

              name,

              category_id:
                parseInt(categoryId),

              description,

              measure,

              stock_status:
                stockStatus,

              brand,

              expiration_date:
                expirationDate || null,

              active: true,

              notes,

            },
          ]);

      if (error) {

        console.log(error);

        alert(
          "Error al guardar"
        );

        return;
      }

      alert(
        "Producto creado"
      );
    }

    setShowModal(false);

    setEditingProductId(null);

    setName("");

    setCategoryId("");

    setDescription("");

    setMeasure("");

    setStockStatus("");

    setBrand("");

    setExpirationDate("");

    setNotes("");

    fetchProducts();
  };

  // ELIMINAR (INACTIVAR)
  const deleteProduct = async (
    id: number
  ) => {

    const confirmDelete =
      confirm(
        "¿Eliminar producto?"
      );

    if (!confirmDelete) return;

    const { error } =
      await supabase

        .from("inventory_products")

        .update({
          active: false,
        })

        .eq("id", id);

    if (error) {

      console.log(error);

      alert(
        "Error al eliminar"
      );

      return;
    }

    alert(
      "Producto eliminado"
    );

    fetchProducts();
  };

  // FILTROS AUTOMATICOS
  useEffect(() => {

    fetchProducts();

  }, [
    search,
    filterCategory,
    sortBy
  ]);

  // CATEGORIAS
  useEffect(() => {

    fetchCategories();

  }, []);

  return (

    <div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-5xl font-bold text-[#243847]">

            Inventario 📦

          </h2>

          <p className="text-gray-600 mt-3 text-lg">

            Gestión de productos

          </p>

        </div>

        <button
          onClick={() => {

            setEditingProductId(
              null
            );

            setName("");

            setCategoryId("");

            setDescription("");

            setMeasure("");

            setStockStatus("");

            setBrand("");

            setExpirationDate("");

            setNotes("");

            setShowModal(true);

          }}
          className="bg-[#243847] text-white px-6 py-4 rounded-2xl"
        >

          + Nuevo Producto

        </button>

      </div>

      {/* FILTROS */}
      <div className="flex gap-4 mb-6">

        {/* BUSCAR */}
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border p-4 rounded-2xl w-[300px]"
        />

        {/* CATEGORIA */}
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
            Todas categorías
          </option>

          {categories.map((category) => (

            <option
              key={category.id}
              value={category.id}
            >

              {category.name}

            </option>

          ))}

        </select>

        {/* ORDENAR */}
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value
            )
          }
          className="border p-4 rounded-2xl"
        >

          <option value="name">
            Ordenar: Nombre
          </option>

          <option value="stock">
            Ordenar: Estado
          </option>

        </select>

      </div>

      {/* TABLA */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-[#243847] text-white">

            <tr>

              <th className="text-left p-5">
                Producto
              </th>

              <th className="text-left p-5">
                Categoría
              </th>

              <th className="text-left p-5">
                Medida
              </th>

              <th className="text-left p-5">
                Estado
              </th>

              <th className="text-left p-5">
                Marca
              </th>

              <th className="text-left p-5">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {products.map((product) => (

              <tr
                key={product.id}
                className="border-b"
              >

                <td className="p-5">

                  {product.name}

                </td>

                <td className="p-5">

                  {
                    product
                    .inventory_categories
                    ?.name
                  }

                </td>

                <td className="p-5">

                  {product.measure}

                </td>

                <td className="p-5">

                  {product.stock_status}

                </td>

                <td className="p-5">

                  {product.brand}

                </td>

                <td className="p-5 flex gap-3">

                  {/* EDITAR */}
                  <button
                    onClick={() => {

                      setEditingProductId(
                        product.id
                      );

                      setName(
                        product.name
                      );

                      setCategoryId(
                        product.category_id?.toString()
                      );

                      setDescription(
                        product.description || ""
                      );

                      setMeasure(
                        product.measure || ""
                      );

                      setStockStatus(
                        product.stock_status || ""
                      );

                      setBrand(
                        product.brand || ""
                      );

                      setExpirationDate(
                        product.expiration_date || ""
                      );

                      setNotes(
                        product.notes || ""
                      );

                      setShowModal(true);

                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl"
                  >

                    Editar

                  </button>

                  {/* ELIMINAR */}
                  <button
                    onClick={() =>
                      deleteProduct(
                        product.id
                      )
                    }
                    className="bg-red-500 text-white px-4 py-2 rounded-xl"
                  >

                    Eliminar

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-8 rounded-3xl w-[600px] shadow-2xl">

            <h3 className="text-2xl font-bold text-[#243847] mb-6">

              {editingProductId
                ? "Editar Producto"
                : "Nuevo Producto"}

            </h3>

            <div className="space-y-4">

              {/* NOMBRE */}
              <input
                type="text"
                placeholder="Nombre producto"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="w-full border p-4 rounded-2xl"
              />

              {/* CATEGORIA */}
              <select
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value
                  )
                }
                className="w-full border p-4 rounded-2xl"
              >

                <option value="">
                  Seleccionar categoría
                </option>

                {categories.map(
                  (category) => (

                    <option
                      key={category.id}
                      value={category.id}
                    >

                      {category.name}

                    </option>

                  )
                )}

              </select>

              {/* DESCRIPCION */}
              <textarea
                placeholder="Descripción"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                className="w-full border p-4 rounded-2xl"
              />

              {/* MEDIDA */}
              <input
                type="text"
                placeholder="250ml / 1 litro / unidad"
                value={measure}
                onChange={(e) =>
                  setMeasure(
                    e.target.value
                  )
                }
                className="w-full border p-4 rounded-2xl"
              />

              {/* STOCK */}
              <select
                value={stockStatus}
                onChange={(e) =>
                  setStockStatus(
                    e.target.value
                  )
                }
                className="w-full border p-4 rounded-2xl"
              >

                <option value="">
                  Estado stock
                </option>

                <option value="Lleno">
                  Lleno
                </option>

                <option value="3/4">
                  3/4
                </option>

                <option value="Mitad">
                  Mitad
                </option>

                <option value="1/4">
                  1/4
                </option>

                <option value="Poco">
                  Poco
                </option>

                <option value="Muy poco">
                  Muy poco
                </option>

                <option value="Vacío">
                  Vacío
                </option>

              </select>

              {/* MARCA */}
              <input
                type="text"
                placeholder="Marca"
                value={brand}
                onChange={(e) =>
                  setBrand(
                    e.target.value
                  )
                }
                className="w-full border p-4 rounded-2xl"
              />

              {/* VENCIMIENTO */}
              <input
                type="date"
                value={expirationDate}
                onChange={(e) =>
                  setExpirationDate(
                    e.target.value
                  )
                }
                className="w-full border p-4 rounded-2xl"
              />

              {/* OBSERVACIONES */}
              <textarea
                placeholder="Observaciones"
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                className="w-full border p-4 rounded-2xl"
              />

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
                onClick={saveProduct}
                className="bg-[#243847] text-white px-5 py-3 rounded-2xl"
              >

                {editingProductId
                  ? "Actualizar"
                  : "Guardar Producto"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}