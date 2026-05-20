"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function WorkersPage() {

  const [workers, setWorkers] =
    useState<any[]>([]);

  const [branches, setBranches] =
    useState<any[]>([]);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingWorkerId,
    setEditingWorkerId] =
    useState<number | null>(null);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [speciality,
    setSpeciality] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [hireDate,
    setHireDate] =
    useState("");

  const [terminationDate,
    setTerminationDate] =
    useState("");

  const [branchId,
    setBranchId] =
    useState("");

  const [photoUrl,
    setPhotoUrl] =
    useState("");

  const [notes, setNotes] =
    useState("");

  // OBTENER TRABAJADORAS
  const fetchWorkers = async () => {

    const { data, error } =
      await supabase

        .from("workers")

        .select("*")

        .eq("active", true)

        .order("name");

    if (error) {

      console.log(error);

      return;
    }

    let filteredWorkers =
      data || [];

    if (search) {

      filteredWorkers =
        filteredWorkers.filter(
          (worker) =>

            worker.name
              ?.toLowerCase()

              .includes(
                search.toLowerCase()
              )
        );
    }

    setWorkers(filteredWorkers);
  };

  // OBTENER SEDES
  const fetchBranches = async () => {

    const { data, error } =
      await supabase

        .from("branches")

        .select("*")

        .eq("active", true)

        .order("name");

    if (error) {

      console.log(error);

      return;
    }

    setBranches(data || []);
  };

  // GUARDAR / EDITAR
  const saveWorker = async () => {

    if (
      !name ||
      !branchId
    ) {

      alert(
        "Completa nombre y sede"
      );

      return;
    }

    // EDITAR
    if (editingWorkerId) {

      const { error } =
        await supabase

          .from("workers")

          .update({

            name,

            phone,

            speciality,

            status,

            hire_date:
              hireDate || null,

            termination_date:
              terminationDate || null,

            branch_id:
              parseInt(branchId),

            photo_url:
              photoUrl,

            notes,

          })

          .eq(
            "id",
            editingWorkerId
          );

      if (error) {

        console.log(error);

        alert(
          "Error al actualizar"
        );

        return;
      }

      alert(
        "Trabajadora actualizada"
      );

    } else {

      const { error } =
        await supabase

          .from("workers")

          .insert([
            {

              name,

              phone,

              speciality,

              status,

              hire_date:
                hireDate || null,

              termination_date:
                terminationDate || null,

              branch_id:
                parseInt(branchId),

              photo_url:
                photoUrl,

              notes,

              active: true,

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
        "Trabajadora creada"
      );
    }

    setShowModal(false);

    setEditingWorkerId(null);

    setName("");

    setPhone("");

    setSpeciality("");

    setStatus("");

    setHireDate("");

    setTerminationDate("");

    setBranchId("");

    setPhotoUrl("");

    setNotes("");

    fetchWorkers();
  };

  // ELIMINAR
  const deleteWorker = async (
    id: number
  ) => {

    const confirmDelete =
      confirm(
        "¿Eliminar trabajadora?"
      );

    if (!confirmDelete) return;

    const { error } =
      await supabase

        .from("workers")

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
      "Trabajadora eliminada"
    );

    fetchWorkers();
  };

  useEffect(() => {

    fetchWorkers();

  }, [search]);

  useEffect(() => {

    fetchBranches();

  }, []);

  return (

    <div className="relative">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-5xl font-bold text-[#243847]">

            Trabajadoras 👩‍💼

          </h2>

          <p className="text-gray-600 mt-3 text-lg">

            Gestión de personal

          </p>

        </div>

        <button
          onClick={() => {

            setEditingWorkerId(
              null
            );

            setName("");

            setPhone("");

            setSpeciality("");

            setStatus("");

            setHireDate("");

            setTerminationDate("");

            setBranchId("");

            setPhotoUrl("");

            setNotes("");

            setShowModal(true);

          }}
          className="bg-[#243847] text-white px-6 py-4 rounded-2xl"
        >

          + Nueva Trabajadora

        </button>

      </div>

      {/* BUSCAR */}
      <div className="mb-6">

        <input
          type="text"
          placeholder="Buscar trabajadora..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border p-4 rounded-2xl w-[300px]"
        />

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
                Especialidad
              </th>

              <th className="text-left p-5">
                Estado
              </th>

              <th className="text-left p-5">
                Sede
              </th>

              <th className="text-left p-5">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {workers.map((worker) => (

              <tr
                key={worker.id}
                className="border-b"
              >

                <td className="p-5">

                  {worker.name}

                </td>

                <td className="p-5">

                  {worker.phone}

                </td>

                <td className="p-5">

                  {worker.speciality}

                </td>

                <td className="p-5">

                  {worker.status}

                </td>

                <td className="p-5">

                  {
                    branches.find(
                      (branch) =>
                        branch.id ===
                        worker.branch_id
                    )?.name
                  }

                </td>

                <td className="p-5 flex gap-3">

                  <button
                    onClick={() => {

                      setEditingWorkerId(
                        worker.id
                      );

                      setName(
                        worker.name
                      );

                      setPhone(
                        worker.phone || ""
                      );

                      setSpeciality(
                        worker.speciality || ""
                      );

                      setStatus(
                        worker.status || ""
                      );

                      setHireDate(
                        worker.hire_date || ""
                      );

                      setTerminationDate(
                        worker.termination_date || ""
                      );

                      setBranchId(
                        worker.branch_id?.toString()
                      );

                      setPhotoUrl(
                        worker.photo_url || ""
                      );

                      setNotes(
                        worker.notes || ""
                      );

                      setShowModal(true);

                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl"
                  >

                    Editar

                  </button>

                  <button
                    onClick={() =>
                      deleteWorker(
                        worker.id
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

        <div className="fixed inset-0 flex items-start justify-center bg-black/40 z-50 p-6 overflow-y-auto">

          <div className="bg-white p-8 rounded-3xl w-full max-w-[650px] shadow-2xl mt-10 mb-20">

            <h3 className="text-2xl font-bold text-[#243847] mb-6">

              {editingWorkerId
                ? "Editar Trabajadora"
                : "Nueva Trabajadora"}

            </h3>

            <div className="space-y-5">

              {/* NOMBRE */}
              <div>

                <label className="block mb-2 font-medium text-[#243847]">
                  Nombre
                </label>

                <input
                  type="text"
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  className="w-full border p-4 rounded-2xl"
                />

              </div>

              {/* TELEFONO */}
              <div>

                <label className="block mb-2 font-medium text-[#243847]">
                  Teléfono
                </label>

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

              </div>

              {/* ESPECIALIDAD */}
              <div>

                <label className="block mb-2 font-medium text-[#243847]">
                  Especialidad
                </label>

                <input
                  type="text"
                  placeholder="Especialidad"
                  value={speciality}
                  onChange={(e) =>
                    setSpeciality(
                      e.target.value
                    )
                  }
                  className="w-full border p-4 rounded-2xl"
                />

              </div>

              {/* ESTADO */}
              <div>

                <label className="block mb-2 font-medium text-[#243847]">
                  Estado
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                  className="w-full border p-4 rounded-2xl"
                >

                  <option value="">
                    Seleccionar estado
                  </option>

                  <option value="Activa">
                    Activa
                  </option>

                  <option value="Inactiva">
                    Inactiva
                  </option>

                  <option value="Vacaciones">
                    Vacaciones
                  </option>

                  <option value="Descanso Médico">
                    Descanso Médico
                  </option>

                </select>

              </div>

              {/* FECHA INGRESO */}
              <div>

                <label className="block mb-2 font-medium text-[#243847]">
                  Fecha de ingreso
                </label>

                <input
                  type="date"
                  value={hireDate}
                  onChange={(e) =>
                    setHireDate(
                      e.target.value
                    )
                  }
                  className="w-full border p-4 rounded-2xl"
                />

              </div>

              {/* FECHA CESE */}
              <div>

                <label className="block mb-2 font-medium text-[#243847]">
                  Fecha de cese
                </label>

                <input
                  type="date"
                  value={terminationDate}
                  onChange={(e) =>
                    setTerminationDate(
                      e.target.value
                    )
                  }
                  className="w-full border p-4 rounded-2xl"
                />

              </div>

              {/* SEDE */}
              <div>

                <label className="block mb-2 font-medium text-[#243847]">
                  Sede
                </label>

                <select
                  value={branchId}
                  onChange={(e) =>
                    setBranchId(
                      e.target.value
                    )
                  }
                  className="w-full border p-4 rounded-2xl"
                >

                  <option value="">
                    Seleccionar sede
                  </option>

                  {branches.map((branch) => (

                    <option
                      key={branch.id}
                      value={branch.id}
                    >

                      {branch.name}

                    </option>

                  ))}

                </select>

              </div>

              {/* FOTO */}
              <div className="flex flex-col items-start">

                <label className="block mb-3 font-medium text-[#243847]">

                  Foto

                </label>

                <label className="flex items-center justify-center w-[180px] h-[180px] border-2 border-dashed rounded-3xl cursor-pointer hover:bg-gray-50 transition overflow-hidden">

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {

                      const file =
                        e.target.files?.[0];

                      if (!file) return;

                      const fileName =
                        `${Date.now()}-${file.name}`;

                      const { error } =
                        await supabase.storage

                          .from("workers")

                          .upload(
                            fileName,
                            file
                          );

                      if (error) {

                        console.log(error);

                        alert(
                          "Error al subir foto"
                        );

                        return;
                      }

                      const {
                        data:
                        publicUrlData,
                      } =
                        supabase.storage

                          .from("workers")

                          .getPublicUrl(
                            fileName
                          );

                      setPhotoUrl(
                        publicUrlData
                          .publicUrl
                      );

                    }}
                  />

                  {photoUrl ? (

                    <img
                      src={photoUrl}
                      alt="Foto"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="text-center">

                      <p className="text-lg font-medium text-[#243847]">

                        Subir Foto

                      </p>

                      <p className="text-gray-500 text-sm mt-1">

                        JPG, PNG

                      </p>

                    </div>

                  )}

                </label>

              </div>

              {/* OBSERVACIONES */}
              <div>

                <label className="block mb-2 font-medium text-[#243847]">
                  Observaciones
                </label>

                <textarea
                  placeholder="Observaciones"
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  className="w-full border p-4 rounded-2xl min-h-[120px]"
                />

              </div>

            </div>

            {/* BOTONES */}
            <div className="flex gap-4 mt-8 pb-2">

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="bg-gray-200 px-5 py-3 rounded-2xl"
              >

                Cancelar

              </button>

              <button
                onClick={saveWorker}
                className="bg-[#243847] text-white px-5 py-3 rounded-2xl"
              >

                {editingWorkerId
                  ? "Actualizar"
                  : "Guardar"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}