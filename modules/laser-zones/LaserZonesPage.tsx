"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LaserZonesPage() {

  const [zones, setZones] =
    useState<any[]>([]);

  const [showModal,
    setShowModal] =
    useState(false);

  const [editingId,
    setEditingId] =
    useState<number | null>(null);

  const [name, setName] =
    useState("");

  const [price, setPrice] =
    useState(0);

  const [search,
    setSearch] =
    useState("");

  const fetchZones =
    async () => {

      const { data, error } =
        await supabase

          .from("laser_zones")

          .select("*")

          .order("name");

      if (error) {

        console.log(error);

        return;

      }

      setZones(data || []);

    };

  useEffect(() => {

    fetchZones();

  }, []);

  const saveZone =
    async () => {

      if (!name) {

        alert("Ingresa nombre");

        return;

      }

      if (editingId) {

        const { error } =
          await supabase

            .from("laser_zones")

            .update({

              name,
              price

            })

            .eq(
              "id",
              editingId
            );

        if (error) {

          console.log(error);

          alert("Error al actualizar");

          return;

        }

        alert("Zona actualizada");

      } else {

        const { error } =
          await supabase

            .from("laser_zones")

            .insert([
              {
                name,
                price,
                active: true
              }
            ]);

        if (error) {

          console.log(error);

          alert("Error al guardar");

          return;

        }

        alert("Zona creada");

      }

      setShowModal(false);

      setEditingId(null);

      setName("");

      setPrice(0);

      fetchZones();

    };

  const deleteZone =
    async (id: number) => {

      const confirmDelete =
        confirm(
          "¿Eliminar zona?"
        );

      if (!confirmDelete)
        return;

      const { error } =
        await supabase

          .from("laser_zones")

          .update({
            active: false
          })

          .eq("id", id);

      if (error) {

        console.log(error);

        alert("Error al eliminar");

        return;

      }

      fetchZones();

    };

  return (

    <div>

      <div className="flex items-center justify-between mb-8">

        <h1 className="text-5xl font-bold text-[#243847]">

          Zonas Láser

        </h1>

        <button
          onClick={() => {

            setEditingId(null);

            setName("");

            setPrice(0);

            setShowModal(true);

          }}
          className="bg-[#243847] text-white px-6 py-4 rounded-2xl"
        >

          + Nueva Zona

        </button>

      </div>

      <div className="mb-6">

        <input
          type="text"
          placeholder="🔍 Buscar zona..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full border p-4 rounded-2xl"
        />

      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-[#243847] text-white">

            <tr>

              <th className="p-5 text-left">
                Zona
              </th>

              <th className="p-5 text-left">
                Precio
              </th>

              <th className="p-5 text-left">
                Estado
              </th>

              <th className="p-5 text-left">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {zones

              .filter(
                (zone) =>

                  zone.name
                    ?.toLowerCase()
                    .includes(
                      search.toLowerCase()
                    )
              )

              .sort(
                (a, b) =>
                  a.name.localeCompare(
                    b.name
                  )
              )

              .map((zone) => (

                <tr
                  key={zone.id}
                  className="border-b"
                >

                  <td className="p-5">

                    {zone.name}

                  </td>

                  <td className="p-5">

                    S/ {Number(
                      zone.price
                    ).toFixed(2)}

                  </td>

                  <td className="p-5">

                    {zone.active
                      ? "Activa"
                      : "Inactiva"}

                  </td>

                  <td className="p-5 flex gap-3">

                    <button
                      onClick={() => {

                        setEditingId(
                          zone.id
                        );

                        setName(
                          zone.name
                        );

                        setPrice(
                          Number(
                            zone.price
                          )
                        );

                        setShowModal(
                          true
                        );

                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-xl"
                    >

                      Editar

                    </button>

                    <button
                      onClick={() =>
                        deleteZone(
                          zone.id
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

      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-8 rounded-3xl w-[500px]">

            <h2 className="text-2xl font-bold mb-6">

              {editingId
                ? "Editar Zona"
                : "Nueva Zona"}

            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Nombre zona"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="w-full border p-4 rounded-2xl"
              />

              <input
                type="number"
                placeholder="Precio"
                value={price}
                onChange={(e) =>
                  setPrice(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="w-full border p-4 rounded-2xl"
              />

            </div>

            <div className="flex gap-4 mt-6">

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="bg-gray-200 px-5 py-3 rounded-2xl"
              >

                Cancelar

              </button>

              <button
                onClick={saveZone}
                className="bg-[#243847] text-white px-5 py-3 rounded-2xl"
              >

                Guardar

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}