"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Props = {
  selectedBranch: number;
};

export default function WorkersPage({
  selectedBranch,
}: Props) {

  const [workers, setWorkers] =
    useState<any[]>([]);
  
  const [color, setColor] =
  useState("#F9A8D4");

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

    const [
  birthDate,
  setBirthDate
] = useState("");

const [
  address,
  setAddress
] = useState("");
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

  const [
  showSchedulesModal,
  setShowSchedulesModal
] = useState(false);

const [
  selectedWorkerId,
  setSelectedWorkerId
] = useState<number | null>(null);

const [
  schedules,
  setSchedules
] = useState<any[]>([]);

const [
  overrides,
  setOverrides
] = useState<any[]>([]);

const days = [

  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",

];

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

            birth_date:
  birthDate || null,

address,

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

            color,

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

              birth_date:
  birthDate || null,

address,

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

              color,

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

    setBirthDate("");

setAddress("");

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

  const saveSchedules = async () => {

  if (!selectedWorkerId)
    return;

  const schedulesToSave =

    schedules.map(
      (schedule) => ({

        worker_id:
          selectedWorkerId,

        day_of_week:
          schedule.day_of_week,

        start_time:
          schedule.start_time || null,

        end_time:
          schedule.end_time || null,

        is_rest_day:
          schedule.is_rest_day || false,

      })
    );

  const { error } =
    await supabase

      .from(
        "worker_schedules"
      )
        
      .upsert(
        schedulesToSave,
        {
          onConflict:
            "worker_id,day_of_week"
        }
      );

  if (error) {

    console.log(error);

    alert(
      "Error guardando horarios"
    );

    return;
  }

  const overridesToSave =

  overrides.map(
    (override) => ({

      worker_id:
        selectedWorkerId,

      override_date:
        override.override_date,

      start_time:
        override.start_time || null,

      end_time:
        override.end_time || null,

      is_day_off:
        override.is_day_off || false,

    })
  );

const {
  error: overridesError
} = await supabase

  .from(
    "worker_schedule_overrides"
  )

  .insert(
    overridesToSave
  );

if (overridesError) {

  console.log(
    overridesError
  );

  alert(
    "Error guardando excepciones"
  );

  return;
}

  alert(
    "Horarios guardados"
  );

  setShowSchedulesModal(
    false
  );

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>

          <h2 className="text-3xl md:text-5xl font-bold text-[#243847]">

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

            setBirthDate("");

setAddress("");

            setSpeciality("");

            setStatus("");

            setHireDate("");

            setTerminationDate("");

            setBranchId("");

            setPhotoUrl("");

            setNotes("");

            setShowModal(true);

          }}
          className="w-full md:w-auto bg-[#243847] text-white px-6 py-4 rounded-2xl"
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
         className="border p-4 rounded-2xl w-full md:w-[300px]"
        />

      </div>

      {/* TABLA */}
      <div className="bg-white rounded-3xl shadow-xl overflow-x-auto">

       <table className="min-w-[900px] w-full">

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

                      setBirthDate(
                        worker.birth_date || ""
                      );

                      setAddress(
                        worker.address || ""
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

                      setColor(
                        worker.color || "#243847"
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

                  <button

 onClick={async () => {

  setSchedules([]);

setOverrides([]);

  setSelectedWorkerId(
    worker.id
  );

  const { data, error } =
    await supabase

      .from(
        "worker_schedules"
      )

      .select("*")

      .eq(
        "worker_id",
        worker.id
      );

  if (error) {

    console.log(error);

    return;
  }

  setSchedules(
    data || []
  );

  const {
  data: overridesData,
  error: overridesError
} = await supabase

  .from(
    "worker_schedule_overrides"
  )

  .select("*")

  .eq(
    "worker_id",
    worker.id
  );

if (overridesError) {

  console.log(
    overridesError
  );

  return;
}

setOverrides(
  overridesData || []
);

  setShowSchedulesModal(
    true
  );

}}

  className="bg-blue-500 text-white px-4 py-2 rounded-xl"

>

  Horarios

</button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {showModal && (

        <div className="absolute inset-0 flex items-start justify-center bg-black/40 z-30 p-6 overflow-y-auto">

          <div className="bg-white p-5 md:p-8 rounded-3xl w-full max-w-[650px] shadow-2xl mt-4 md:mt-10 mb-10 md:mb-20 max-h-[95vh] overflow-y-auto">

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
                {/* FECHA NACIMIENTO */}
<div>

  <label className="block mb-2 font-medium text-[#243847]">

    Fecha de nacimiento

  </label>

  <input
    type="date"
    value={birthDate}
    onChange={(e) =>
      setBirthDate(
        e.target.value
      )
    }
    className="w-full border p-4 rounded-2xl"
  />

</div>

{/* DIRECCIÓN */}
<div>

  <label className="block mb-2 font-medium text-[#243847]">

    Dirección

  </label>

  <input
    type="text"
    placeholder="Dirección"
    value={address}
    onChange={(e) =>
      setAddress(
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

              <div>

              <label className="block mb-2 font-medium text-[#243847]">

                Color agenda

              </label>

              <input
                type="color"
                value={color}
                onChange={(e) =>
                  setColor(
                    e.target.value
                  )
                }
                className="w-[120px] h-[60px] border rounded-2xl cursor-pointer"
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

                <label className="flex items-center justify-center w-36 h-36 md:w-[180px] md:h-[180px] border-2 border-dashed rounded-3xl cursor-pointer hover:bg-gray-50 transition overflow-hidden">

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



  <div className="relative w-full h-full">

  <img
    src={photoUrl}
    alt="Foto"
    className="w-full h-full object-cover"
  />

  <a
    href={photoUrl}
    target="_blank"
    className="absolute bottom-2 left-2 bg-[#243847] text-white text-sm px-3 py-1 rounded-xl"
  >

    Ver foto

  </a>

</div>



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
            <div className="flex flex-col-reverse md:flex-row gap-4 mt-8 pb-2">

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="w-full md:w-auto bg-gray-200 px-5 py-3 rounded-2xl"
              >

                Cancelar

              </button>

              <button
                onClick={saveWorker}
                className="w-full md:w-auto bg-[#243847] text-white px-5 py-3 rounded-2xl"
              >

                {editingWorkerId
                  ? "Actualizar"
                  : "Guardar"}

              </button>

            </div>

          </div>

        </div>

      )}

      {showSchedulesModal && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded-3xl w-full max-w-3xl">

      <h2 className="text-2xl font-bold mb-6">

        Horarios laborales

      </h2>

      <div className="space-y-4">

        {days.map((day, index) => (

          <div

            key={index}

            className="grid grid-cols-4 gap-4 items-center"

          >

            <p className="font-medium">

              {day}

            </p>

           <input

  type="time"

  value={
    schedules[index]
      ?.start_time || ""
  }

  onChange={(e) => {

    const updated =
      [...schedules];

    updated[index] = {

      ...updated[index],

      day_of_week:
        index,

      start_time:
        e.target.value,

    };

    setSchedules(
      updated
    );

  }}

  className="border p-2 rounded-xl"

/>

            <input

  type="time"

  value={
    schedules[index]
      ?.end_time || ""
  }

  onChange={(e) => {

    const updated =
      [...schedules];

    updated[index] = {

      ...updated[index],

      day_of_week:
        index,

      end_time:
        e.target.value,

    };

    setSchedules(
      updated
    );

  }}

  className="border p-2 rounded-xl"

/>

            <label className="flex items-center gap-2">

             <input

  type="checkbox"

  checked={
    schedules[index]
      ?.is_rest_day || false
  }

  onChange={(e) => {

    const updated =
      [...schedules];

    updated[index] = {

      ...updated[index],

      day_of_week:
        index,

      is_rest_day:
        e.target.checked,

    };

    setSchedules(
      updated
    );

  }}

/>

              Descanso

            </label>

          </div>

        ))}

      </div>

      <div className="mt-8">

  <div className="flex items-center justify-between mb-4">

    <h3 className="text-xl font-bold">

      Excepciones

    </h3>

    <button

      onClick={() => {

        setOverrides([

          ...overrides,

          {

            override_date: "",

            start_time: "",

            end_time: "",

            is_day_off: false,

          },

        ]);

      }}

      className="bg-[#243847] text-white px-4 py-2 rounded-2xl"

    >

      + Agregar excepción

    </button>

  </div>

  <div className="space-y-4">

    {overrides.map(
      (override, index) => (

        <div

          key={index}

          className="grid grid-cols-4 gap-4 items-center"

        >

          <input

            type="date"

            value={
              override.override_date
            }

            onChange={(e) => {

              const updated =
                [...overrides];

              updated[index]
                .override_date =
                  e.target.value;

              setOverrides(
                updated
              );

            }}

            className="border p-2 rounded-xl"

          />

          <input

            type="time"

            value={
              override.start_time
            }

            onChange={(e) => {

              const updated =
                [...overrides];

              updated[index]
                .start_time =
                  e.target.value;

              setOverrides(
                updated
              );

            }}

            className="border p-2 rounded-xl"

          />

          <input

            type="time"

            value={
              override.end_time
            }

            onChange={(e) => {

              const updated =
                [...overrides];

              updated[index]
                .end_time =
                  e.target.value;

              setOverrides(
                updated
              );

            }}

            className="border p-2 rounded-xl"

          />

          <label className="flex items-center gap-2">

            <input

              type="checkbox"

              checked={
                override.is_day_off
              }

              onChange={(e) => {

                const updated =
                  [...overrides];

                updated[index]
                  .is_day_off =
                    e.target.checked;

                setOverrides(
                  updated
                );

              }}

            />

            Descanso

          </label>

        </div>

      )
    )}

  </div>

</div>

      <div className="flex justify-end gap-4 mt-8">

        <button

          onClick={() =>
            setShowSchedulesModal(false)
          }

          className="bg-gray-300 px-5 py-3 rounded-2xl"

        >

          Cerrar

        </button>

        <button

  onClick={
    saveSchedules
  }

  className="bg-[#243847] text-white px-5 py-3 rounded-2xl"

>

  Guardar horarios

</button>

      </div>

    </div>

  </div>

)}
      

    </div>

  );
}