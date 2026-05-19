"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { supabase } from "@/lib/supabase";

type Service = {
  id: number;
  name: string;
  price: number;
  duration: string;
  protocol_url?: string;
};

export default function ServicesPage() {

  const [services, setServices] = useState<Service[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [protocolUrl, setProtocolUrl] = useState("");
  const [protocolFile, setProtocolFile] = useState<File | null>(null);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [sortBy, setSortBy] = useState("id");

  // OBTENER SERVICIOS
  const fetchServices = async () => {

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setServices(data);
    }
  };

  // CARGAR
  useEffect(() => {
    fetchServices();
  }, []);

  // GUARDAR
  const saveService = async () => {

    let uploadedProtocolUrl = protocolUrl;

    if (
      !name ||
      !price ||
      !duration
    ) return;

        // SUBIR PDF
if (protocolFile) {

  const fileName =
    `${Date.now()}-${protocolFile.name}`;

  const { error } = await supabase.storage

    .from("protocols")

    .upload(
      fileName,
      protocolFile
    );

  if (!error) {

    const { data } = supabase.storage

      .from("protocols")

      .getPublicUrl(fileName);

    uploadedProtocolUrl =
      data.publicUrl;
  }
}

    // EDITAR
    if (editingId) {

      await supabase
        .from("services")
        .update({
          name,
          price,
          duration,
          protocol_url: uploadedProtocolUrl,
        })
        .eq("id", editingId);

      setEditingId(null);

    } else {

      // CREAR
      await supabase
        .from("services")
        .insert([
          {
            name,
            price,
            duration,
            protocol_url: uploadedProtocolUrl,
          },
        ]);
    }

    // LIMPIAR
    setName("");
    setPrice("");
    setDuration("");
    setProtocolUrl("");

    fetchServices();
  };

  // ELIMINAR
  const deleteService = async (id: number) => {

    await supabase
      .from("services")
      .delete()
      .eq("id", id);

    fetchServices();
  };

  // EDITAR
  const editService = (service: Service) => {

    setEditingId(service.id);

    setName(service.name);
    setPrice(String(service.price));
    setDuration(service.duration);
    setProtocolUrl(service.protocol_url || "");
  };

  return (
    <div>

      {/* Header */}
      <div className="mb-8">

        <h2 className="text-5xl font-bold text-[#243847]">
          Servicios Premium ✨
        </h2>

        <p className="text-gray-600 mt-3 text-lg">
          Gestión completa de servicios
        </p>

      </div>

      {/* Formulario */}
      <div className="bg-white p-8 rounded-3xl shadow-xl mb-10">

        <h3 className="text-2xl font-bold text-[#243847] mb-6">

          {editingId
            ? "Editar Servicio"
            : "Agregar Servicio"}

        </h3>

        <div className="grid grid-cols-4 gap-4">

          <input
            type="text"
            placeholder="Nombre del servicio"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-4 rounded-2xl"
          />

          <input
            type="number"
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border p-4 rounded-2xl"
          />

          <input
            type="text"
            placeholder="Duración"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="border p-4 rounded-2xl"
          />

          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {

              if (e.target.files?.[0]) {
                setProtocolFile(e.target.files[0]);
              }

            }}
            className="border p-4 rounded-2xl"
          />

        </div>

        <button
          onClick={saveService}
          className="mt-6 bg-[#243847] text-white px-6 py-3 rounded-2xl hover:opacity-90 transition"
        >

          {editingId
            ? "Actualizar Servicio"
            : "Guardar Servicio"}

        </button>

      </div>

      {/* Ordenamiento */}
      <div className="flex justify-end mb-4">

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-3 rounded-2xl bg-white"
        >

          <option value="id">
            Más recientes
          </option>

          <option value="name">
            Nombre A-Z
          </option>

          <option value="price">
            Precio menor a mayor
          </option>

        </select>

      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-[#dbe8ee]">

            <tr>

              <th className="text-left p-5">
                Servicio
              </th>

              <th className="text-left p-5">
                Precio
              </th>

              <th className="text-left p-5">
                Duración
              </th>

              <th className="text-left p-5">
                Protocolo
              </th>

              <th className="text-left p-5">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {[...services]

              .sort((a, b) => {

                if (sortBy === "name") {
                  return a.name.localeCompare(b.name);
                }

                if (sortBy === "price") {
                  return Number(a.price) - Number(b.price);
                }

                return b.id - a.id;
              })

              .map((service) => (

                <tr
                  key={service.id}
                  className="border-t"
                >

                  <td className="p-5 font-medium">
                    {service.name}
                  </td>

                  <td className="p-5">
                    S/ {service.price}
                  </td>

                  <td className="p-5">
                    {service.duration}
                  </td>

                  {/* PDF */}
                  <td className="p-5">

                    {service.protocol_url ? (

                      <a
                        href={service.protocol_url}
                        target="_blank"
                        className="bg-[#243847] text-white px-4 py-2 rounded-xl"
                      >
                        Ver PDF
                      </a>

                    ) : (

                      <span className="text-gray-400">
                        Sin protocolo
                      </span>

                    )}

                  </td>

                  <td className="p-5">

                    <div className="flex gap-3">

                      {/* EDITAR */}
                      <button
                        onClick={() => editService(service)}
                        className="bg-blue-100 p-3 rounded-xl hover:scale-105 transition"
                      >
                        <Pencil size={18} />
                      </button>

                      {/* ELIMINAR */}
                      <button
                        onClick={() =>
                          deleteService(service.id)
                        }
                        className="bg-red-100 p-3 rounded-xl hover:scale-105 transition"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}