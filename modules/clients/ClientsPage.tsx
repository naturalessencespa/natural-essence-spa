"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function ClientsPage() {

  const [clients, setClients] =
    useState<any[]>([]);

  const [showModal, setShowModal] =
    useState(false);

  const [editingClientId,
    setEditingClientId] =
    useState<number | null>(null);

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  // OBTENER CLIENTES
  const fetchClients = async () => {

    const { data, error } =
      await supabase

        .from("clients")

        .select("*")

        .order("id", {
          ascending: false,
        });

    if (error) {

      console.log(error);

      return;
    }

    setClients(data || []);
  };

  // GUARDAR / EDITAR CLIENTE
  const saveClient = async () => {

    if (!fullName) {

      alert("Ingresa nombre");

      return;
    }

    // EDITAR
    if (editingClientId) {

      const { error } =
        await supabase

          .from("clients")

          .update({

            full_name: fullName,

            phone,

            email,

          })

          .eq(
            "id",
            editingClientId
          );

      if (error) {

        console.log(error);

        alert("Error al actualizar");

        return;
      }

      alert("Cliente actualizado");

    } else {

      // CREAR
      const { error } =
        await supabase

          .from("clients")

          .insert([
            {

              full_name: fullName,

              phone,

              email,

            },
          ]);

      if (error) {

        console.log(error);

        alert("Error al guardar");

        return;
      }

      alert("Cliente creado");
    }

    setShowModal(false);

    setEditingClientId(null);

    setFullName("");

    setPhone("");

    setEmail("");

    fetchClients();
  };



  useEffect(() => {

    fetchClients();

  }, []);

  return (

    <div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-5xl font-bold text-[#243847]">

            Clientes 👩‍💼

          </h2>

          <p className="text-gray-600 mt-3 text-lg">

            Gestión de clientes

          </p>

        </div>

        <button
          onClick={() => {

            setEditingClientId(
              null
            );

            setFullName("");

            setPhone("");

            setEmail("");

            setShowModal(true);

          }}
          className="bg-[#243847] text-white px-6 py-4 rounded-2xl"
        >

          + Nuevo Cliente

        </button>

      </div>

      {/* TABLA */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-[#243847] text-white">

            <tr>

              <th className="text-left p-5">
                Nombre
              </th>

              <th className="text-left p-5">
                Teléfono
              </th>

              <th className="text-left p-5">
                Email
              </th>

              <th className="text-left p-5">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {clients.map((client) => (

              <tr
                key={client.id}
                className="border-b"
              >

                <td className="p-5">

                  {client.full_name}

                </td>

                <td className="p-5">

                  {client.phone}

                </td>

                <td className="p-5">

                  {client.email}

                </td>

                <td className="p-5 flex gap-3">

                  {/* EDITAR */}
                  <button
                    onClick={() => {

                      setEditingClientId(
                        client.id
                      );

                      setFullName(
                        client.full_name
                      );

                      setPhone(
                        client.phone || ""
                      );

                      setEmail(
                        client.email || ""
                      );

                      setShowModal(true);

                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl"
                  >

                    Editar


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

          <div className="bg-white p-8 rounded-3xl w-[500px] shadow-2xl">

            <h3 className="text-2xl font-bold text-[#243847] mb-6">

              {editingClientId
                ? "Editar Cliente"
                : "Nuevo Cliente"}

            </h3>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Nombre completo"
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                className="w-full border p-4 rounded-2xl"
              />

              <input
                type="text"
                placeholder="Teléfono"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                className="w-full border p-4 rounded-2xl"
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(
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
                onClick={saveClient}
                className="bg-[#243847] text-white px-5 py-3 rounded-2xl"
              >

                {editingClientId
                  ? "Actualizar"
                  : "Guardar Cliente"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}   