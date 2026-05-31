"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function ClientsPage() {

  const [clients, setClients] =
    useState<any[]>([]);

    const [
  search,
  setSearch
] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [showViewModal,
    setShowViewModal] =
    useState(false);

  const [selectedClient,
    setSelectedClient] =
    useState<any>(null);

  const [editingClientId,
    setEditingClientId] =
    useState<number | null>(null);

  const [fullName, setFullName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [birthDate,
    setBirthDate] =
    useState("");

  const [dni, setDni] =
    useState("");

  const [address,
    setAddress] =
    useState("");

  const [allergies,
    setAllergies] =
    useState("");

  const [medicalConditions,
    setMedicalConditions] =
    useState("");

  const [consentSigned,
    setConsentSigned] =
    useState(false);

  const [emergencyContact,
    setEmergencyContact] =
    useState("");

  const [emergencyPhone,
    setEmergencyPhone] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [fileUrl, setFileUrl] =
    useState("");

  // OBTENER CLIENTES
  const fetchClients = async () => {

    const { data, error } =
      await supabase

        .from("clients")

        .select("*")

        .eq("active", true)

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

            birth_date:
              birthDate || null,

            dni,

            address,

            allergies,

            medical_conditions:
              medicalConditions,

            consent_signed:
              consentSigned,

            emergency_contact:
              emergencyContact,

            emergency_phone:
              emergencyPhone,

            notes,

            file_url:
              fileUrl,

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

              birth_date:
                birthDate || null,

              dni,

              address,

              allergies,

              medical_conditions:
                medicalConditions,

              consent_signed:
                consentSigned,

              emergency_contact:
                emergencyContact,

              emergency_phone:
                emergencyPhone,

              notes,

              file_url:
                fileUrl,

              active: true,

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

    setBirthDate("");

    setDni("");

    setAddress("");

    setAllergies("");

    setMedicalConditions("");

    setConsentSigned(false);

    setEmergencyContact("");

    setEmergencyPhone("");

    setNotes("");

    setFileUrl("");

    fetchClients();
  };

  // ELIMINAR
  const deleteClient = async (
    id: number
  ) => {

    const confirmDelete =
      confirm(
        "¿Eliminar cliente?"
      );

    if (!confirmDelete) return;

    const { error } =
      await supabase

        .from("clients")

        .update({
          active: false,
        })

        .eq("id", id);

    if (error) {

      console.log(error);

      alert("Error al eliminar");

      return;
    }

    alert("Cliente eliminado");

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

            setBirthDate("");

            setDni("");

            setAddress("");

            setAllergies("");

            setMedicalConditions("");

            setConsentSigned(false);

            setEmergencyContact("");

            setEmergencyPhone("");

            setNotes("");

            setFileUrl("");

            setShowModal(true);

          }}
          className="bg-[#243847] text-white px-6 py-4 rounded-2xl"
        >

          + Nuevo Cliente

        </button>

      </div>

      {/* TABLA */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

      <div className="mb-6">

  <input
    type="text"
    placeholder="🔍 Buscar por nombre o teléfono"
    value={search}
    onChange={(e) =>
      setSearch(
        e.target.value
      )
    }
    className="w-full border p-4 rounded-2xl"
  />

</div>

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
                Consentimiento
              </th>

              <th className="text-left p-5">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

{clients

  .filter(
    (client) =>

      client.full_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )

      ||

      client.phone
        ?.includes(search)
  )

  .sort(
    (a, b) =>
      a.full_name.localeCompare(
        b.full_name
      )
  )

  .map((client) => (

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

                <td className="p-5">

                  {client.consent_signed
                    ? "Sí"
                    : "No"}

                </td>

                <td className="p-5 flex gap-3">

                  {/* VER */}
                  <button
                    onClick={() => {

                      setSelectedClient(
                        client
                      );

                      setShowViewModal(true);

                    }}
                    className="bg-[#243847] text-white px-4 py-2 rounded-xl"
                  >

                    Ver

                  </button>

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

                      setBirthDate(
                        client.birth_date || ""
                      );

                      setDni(
                        client.dni || ""
                      );

                      setAddress(
                        client.address || ""
                      );

                      setAllergies(
                        client.allergies || ""
                      );

                      setMedicalConditions(
                        client.medical_conditions || ""
                      );

                      setConsentSigned(
                        client.consent_signed || false
                      );

                      setEmergencyContact(
                        client.emergency_contact || ""
                      );

                      setEmergencyPhone(
                        client.emergency_phone || ""
                      );

                      setNotes(
                        client.notes || ""
                      );

                      setFileUrl(
                        client.file_url || ""
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
                      deleteClient(
                        client.id
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

      {/* MODAL VER CLIENTE */}
      {showViewModal &&
        selectedClient && (

        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto p-6">

          <div className="bg-white p-8 rounded-3xl w-full max-w-[1100px] max-h-[90vh] overflow-y-auto shadow-2xl mt-10 mb-20">

            <div className="flex items-center justify-between mb-8">

              <h3 className="text-3xl font-bold text-[#243847]">

                Cliente

              </h3>

              <button
                onClick={() =>
                  setShowViewModal(
                    false
                  )
                }
                className="bg-gray-200 px-4 py-2 rounded-xl"
              >

                Cerrar

              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>

                <p className="text-gray-500 text-sm">

                  Nombre

                </p>

                <p className="font-semibold text-lg">

                  {selectedClient.full_name}

                </p>

              </div>

              <div>

                <p className="text-gray-500 text-sm">

                  Teléfono

                </p>

                <p className="font-semibold text-lg">

                  {selectedClient.phone || "-"}

                </p>

              </div>

              <div>

                <p className="text-gray-500 text-sm">

                  Email

                </p>

                <p className="font-semibold text-lg">

                  {selectedClient.email || "-"}

                </p>

              </div>

              <div>

                <p className="text-gray-500 text-sm">

                  DNI

                </p>

                <p className="font-semibold text-lg">

                  {selectedClient.dni || "-"}

                </p>

              </div>

              <div>

                <p className="text-gray-500 text-sm">

                  Fecha nacimiento

                </p>

                <p className="font-semibold text-lg">

                  {selectedClient.birth_date || "-"}

                </p>

              </div>

              <div>

                <p className="text-gray-500 text-sm">

                  Dirección

                </p>

                <p className="font-semibold text-lg">

                  {selectedClient.address || "-"}

                </p>

              </div>

              <div className="md:col-span-2">

                <p className="text-gray-500 text-sm">

                  Alergias

                </p>

                <p className="font-semibold text-lg">

                  {selectedClient.allergies || "-"}

                </p>

              </div>

              <div className="md:col-span-2">

                <p className="text-gray-500 text-sm">

                  Condiciones médicas

                </p>

                <p className="font-semibold text-lg">

                  {selectedClient.medical_conditions || "-"}

                </p>

              </div>

              <div>

                <p className="text-gray-500 text-sm">

                  Contacto emergencia

                </p>

                <p className="font-semibold text-lg">

                  {selectedClient.emergency_contact || "-"}

                </p>

              </div>

              <div>

                <p className="text-gray-500 text-sm">

                  Teléfono emergencia

                </p>

                <p className="font-semibold text-lg">

                  {selectedClient.emergency_phone || "-"}

                </p>

              </div>

              <div>

                <p className="text-gray-500 text-sm">

                  Consentimiento

                </p>

                <p className="font-semibold text-lg">

                  {selectedClient.consent_signed
                    ? "Sí"
                    : "No"}

                </p>

              </div>

              <div className="md:col-span-2">

                <p className="text-gray-500 text-sm">

                  Observaciones

                </p>

                <p className="font-semibold text-lg whitespace-pre-wrap">

                  {selectedClient.notes || "-"}

                </p>

              </div>

              {selectedClient.file_url && (

                <div className="md:col-span-2">

                  <a
                    href={
                      selectedClient.file_url
                    }
                    target="_blank"
                    className="bg-[#243847] text-white px-5 py-3 rounded-2xl inline-block"
                  >

                    Ver consentimiento

                  </a>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

      {/* MODAL EDITAR / CREAR */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto p-6">

        <div className="bg-white p-8 rounded-3xl w-full max-w-[1100px] max-h-[90vh] overflow-y-auto shadow-2xl mt-10 mb-20">

            <h3 className="text-2xl font-bold text-[#243847] mb-6">

              {editingClientId
                ? "Editar Cliente"
                : "Nuevo Cliente"}

            </h3>

            <div className="grid grid-cols-2 gap-4">

              <input
                type="text"
                placeholder="Nombre completo"
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 bg-[#f8fafc] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#243847]"
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
                className="w-full border border-gray-200 bg-[#f8fafc] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#243847]"
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
                className="w-full border border-gray-200 bg-[#f8fafc] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#243847]"
              />

              <input
                type="date"
                value={birthDate}
                onChange={(e) =>
                  setBirthDate(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 bg-[#f8fafc] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#243847]"
              />

              <input
                type="text"
                placeholder="DNI"
                value={dni}
                onChange={(e) =>
                  setDni(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 bg-[#f8fafc] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#243847]"
              />

              <input
                type="text"
                placeholder="Dirección"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 bg-[#f8fafc] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#243847]"
              />
                    <div className="col-span-2 pt-4">

                    <h3 className="text-xl font-bold text-[#243847]">

                      Información médica

                    </h3>

                  </div>
             <div className="col-span-2">

  <label className="block mb-2 font-medium text-[#243847]">

    Alergias

  </label>

  <textarea
    placeholder="Alergias"
    value={allergies}
    onChange={(e) =>
      setAllergies(
        e.target.value
      )
    }
    className="w-full border border-gray-200 bg-[#f8fafc] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#243847]"
  />

</div>

              <div className="col-span-2">

  <label className="block mb-2 font-medium text-[#243847]">

    Condiciones médicas

  </label>

  <textarea
    placeholder="Condiciones médicas"
    value={medicalConditions}
    onChange={(e) =>
      setMedicalConditions(
        e.target.value
      )
    }
    className="col-span-2 w-full border border-gray-200 bg-[#f8fafc] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#243847]"
  />

</div>
                  <div className="col-span-2 pt-4">

                <h3 className="text-xl font-bold text-[#243847]">

                  Contacto de emergencia

                </h3>

              </div>

              <input
                type="text"
                placeholder="Contacto emergencia"
                value={emergencyContact}
                onChange={(e) =>
                  setEmergencyContact(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 bg-[#f8fafc] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#243847]"
              />

              <input
                type="text"
                placeholder="Teléfono emergencia"
                value={emergencyPhone}
                onChange={(e) =>
                  setEmergencyPhone(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 bg-[#f8fafc] p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#243847]"
              />

              <textarea
                placeholder="Observaciones"
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                className="col-span-2 w-full border p-4 rounded-2xl min-h-[120px]"
              />
                  <div className="col-span-2 pt-4">

                  <h3 className="text-xl font-bold text-[#243847]">

                    Documentos

                  </h3>

                </div>
              {/* SUBIR ARCHIVO */}
              <div className="col-span-2">

                <label className="block mb-2 font-medium text-[#243847]">

                  Consentimiento / Ficha

                </label>

                <label className="flex items-center justify-center w-full min-h-[90px] border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer hover:bg-gray-50 transition p-6">

                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={async (e) => {

                      const file =
                        e.target.files?.[0];

                      if (!file) return;

                      const fileName =
                        `${Date.now()}-${file.name}`;

                      const { error } =
                        await supabase.storage

                          .from("client-files")

                          .upload(
                            fileName,
                            file
                          );

                      if (error) {

                        console.log(error);

                        alert(
                          "Error al subir archivo"
                        );

                        return;
                      }

                      const {
                        data:
                        publicUrlData,
                      } =
                        supabase.storage

                          .from("client-files")

                          .getPublicUrl(
                            fileName
                          );

                      setFileUrl(
                        publicUrlData
                          .publicUrl
                      );

                      setConsentSigned(true);

                      alert(
                        "Archivo subido"
                      );

                    }}
                  />

                  <div className="text-center">

                    <p className="text-lg font-medium text-[#243847]">

                      Subir Consentimiento

                    </p>

                    <p className="text-sm text-gray-500 mt-1">

                      PDF o Imagen

                    </p>

                  </div>

                </label>

                {fileUrl && (

                  <a
                    href={fileUrl}
                    target="_blank"
                    className="text-blue-600 underline mt-3 block"
                  >

                    Ver archivo subido

                  </a>

                )}

              </div>

              {/* CONSENTIMIENTO */}
              <div className="col-span-2 flex items-center gap-3">

                <input
                  type="checkbox"
                  checked={consentSigned}
                  disabled
                  className="w-5 h-5"
                />

                <label className="font-medium text-[#243847]">

                  Consentimiento firmado

                </label>

              </div>

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