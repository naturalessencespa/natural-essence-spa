"use client";

import { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";

import timeGridPlugin from "@fullcalendar/timegrid";

import interactionPlugin from "@fullcalendar/interaction";

import esLocale from "@fullcalendar/core/locales/es";

import { supabase } from "@/lib/supabase";


export default function AppointmentsPage() {

  const [events, setEvents] =
    useState<any[]>([]);

  const [selectedDate,
    setSelectedDate] =
    useState("");

  const [showModal,
    setShowModal] =
    useState(false);

  const [editingAppointmentId,
    setEditingAppointmentId] =
    useState<number | null>(null);

  const [clientId, setClientId] =
    useState("");

  const [serviceId,
    setServiceId] =
    useState("");

  const [workerId,
    setWorkerId] =
    useState("");

  const [branchId,
    setBranchId] =
    useState("");

  const [clients, setClients] =
    useState<any[]>([]);

  const [services,
    setServices] =
    useState<any[]>([]);

  const [workers, setWorkers] =
    useState<any[]>([]);

  const [branches,
    setBranches] =
    useState<any[]>([]);
  

  // OBTENER CITAS
  const fetchAppointments = async () => {

    const { data, error } =
      await supabase

        .from("appointments")

        .select(`
          *,
          clients(full_name),
          services(name),
          workers(
            name,
            color
          )
        `);

    if (error) {

      console.log(error);

      return;
    }

    const formattedEvents =
      (data || []).map(
        (appointment) => ({

          id: appointment.id,

          title:
            appointment.clients
              ?.full_name +
            " - " +
            appointment.services
              ?.name +
            " - " +
            appointment.workers
              ?.name,

          start: new Date(
            appointment.appointment_date +
            "T" +
            appointment.start_time
          ),

          end: new Date(
            appointment.appointment_date +
            "T" +
            appointment.end_time
          ),

          backgroundColor:
            appointment.workers
              ?.color ||
            "#243847",

          borderColor:
            appointment.workers
              ?.color ||
            "#243847",

          extendedProps: {

            id: appointment.id,

            client_id:
              appointment.client_id,

            service_id:
              appointment.service_id,

            worker_id:
              appointment.worker_id,

            branch_id:
              appointment.branch_id,

          },

        })
      );

    setEvents(formattedEvents);
  };

  // OBTENER DATOS FORMULARIO
  const fetchFormData = async () => {

    const { data: clientsData } =
      await supabase

        .from("clients")

        .select("*")

        .eq("active", true);

    const { data: servicesData } =
      await supabase

        .from("services")

        .select("*");

    const { data: workersData } =
      await supabase

        .from("workers")

        .select("*")

        .eq("active", true);

    const { data: branchesData } =
      await supabase

        .from("branches")

        .select("*")

        .eq("active", true);

    setClients(clientsData || []);

    setServices(servicesData || []);

    setWorkers(workersData || []);

    setBranches(branchesData || []);
  };

  // GUARDAR / EDITAR CITA
  const saveAppointment = async () => {

    if (
      !clientId ||
      !serviceId ||
      !workerId ||
      !branchId
    ) {

      alert(
        "Completa todos los campos"
      );

      return;
    }

    const start =
      new Date(selectedDate);

    // OBTENER SERVICIO
    const selectedService =
      services.find(
        (service) =>
          service.id ===
          parseInt(serviceId)
      );

    let durationMinutes = 60;

    if (
      selectedService?.duration
    ) {

      const durationText =
        selectedService.duration
          .toLowerCase();

      // HORAS
      if (
        durationText.includes(
          "hora"
        )
      ) {

        const hours =
          parseInt(
            durationText
          ) || 1;

        durationMinutes =
          hours * 60;
      }

      // MINUTOS
      if (
        durationText.includes(
          "minuto"
        )
      ) {

        durationMinutes =
          parseInt(
            durationText
          ) || 60;
      }

    }

    const end =
      new Date(start);

    end.setMinutes(
      end.getMinutes() +
        durationMinutes
    );

    // VALIDAR SOLAPAMIENTO REAL
    const appointmentDate =
      start
        .toISOString()
        .split("T")[0];

    const startTime =
      start
        .toTimeString()
        .slice(0, 5);

    const endTime =
      end
        .toTimeString()
        .slice(0, 5);

    const {
      data:
        existingAppointments,
      error:
        validationError,
    } =
      await supabase

        .from("appointments")

        .select("*")

        .eq(
          "worker_id",
          parseInt(workerId)
        )

        .eq(
          "appointment_date",
          appointmentDate
        );

    if (validationError) {

      console.log(
        validationError
      );

      alert(
        "Error validando horario"
      );

      return;
    }

    const overlappingAppointments =
      existingAppointments?.filter(
        (appointment) => {

          // IGNORAR MISMA CITA EN EDICIÓN
          if (
            appointment.id ===
            editingAppointmentId
          ) {

            return false;
          }

          const existingStart =
            appointment.start_time;

          const existingEnd =
            appointment.end_time;

          return (

            startTime <
              existingEnd &&
            endTime >
              existingStart

          );

        }
      );

    if (
      overlappingAppointments &&
      overlappingAppointments.length >
        0
    ) {

      alert(
        "La trabajadora ya tiene una reserva en ese horario"
      );

      return;
    }

            // VALIDAR CRUCE
    const { data: conflicts } =
      await supabase

        .from(
          "appointments"
        )

        .select("*")

  

        .eq(
          "appointment_date",
          appointmentDate
        )

        .neq(
          "id",
          editingAppointmentId || 0
        );

    const hasConflict =
      conflicts?.some(
        (appt: any) =>

          startTime <
            appt.end_time

          &&

          endTime >
            appt.start_time
      );

    if (hasConflict) {

      alert(
        "La trabajadora ya tiene una cita en ese horario"
      );

      return;
    }

    // EDITAR
    if (editingAppointmentId) {

      const { error } =
        await supabase

          .from("appointments")

          .update({

            client_id:
              parseInt(
                clientId
              ),

            service_id:
              parseInt(
                serviceId
              ),

            worker_id:
              parseInt(
                workerId
              ),

            branch_id:
              parseInt(
                branchId
              ),

            appointment_date:
              appointmentDate,

            start_time:
              startTime,

            end_time:
              endTime,

          })

          .eq(
            "id",
            editingAppointmentId
          );

      if (error) {

        console.log(error);

        alert(
          "Error al editar"
        );

        return;
      }

      alert(
        "Reserva actualizada"
      );

    } else {
        // VALIDAR CRUCE
const { data: conflicts } =
  await supabase

    .from(
      "appointments"
    )

    .select("*")



    .eq(
      "appointment_date",
      appointmentDate
    );

const hasConflict =
  conflicts?.some(
    (appt: any) => {

      const newStart =
        new Date(
          `2000-01-01T${startTime}`
        );

      const newEnd =
        new Date(
          `2000-01-01T${endTime}`
        );

      const existingStart =
        new Date(
          `2000-01-01T${appt.start_time}`
        );

      const existingEnd =
        new Date(
          `2000-01-01T${appt.end_time}`
        );

      return (

        newStart <
          existingEnd

        &&

        newEnd >
          existingStart

      );
    }
  );

if (hasConflict) {

  alert(
    "La trabajadora ya tiene una cita en ese horario"
  );

  return;
}
      
      // CREAR
      const { error } =
        await supabase

          .from("appointments")

          

          .insert([
            {

              client_id:
                parseInt(
                  clientId
                ),

              service_id:
                parseInt(
                  serviceId
                ),

              worker_id:
                parseInt(
                  workerId
                ),

              branch_id:
                parseInt(
                  branchId
                ),

              appointment_date:
                appointmentDate,

              start_time:
                startTime,

              end_time:
                endTime,

              status:
                "confirmed",

              notes: "",

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
        "Reserva guardada"
      );
    }

    setShowModal(false);

    setEditingAppointmentId(
      null
    );

    setClientId("");

    setServiceId("");

    setWorkerId("");

    setBranchId("");

    fetchAppointments();
  };


  // CARGAR
  useEffect(() => {

    fetchAppointments();

    fetchFormData();

  }, []);

  return (

    <div>

      {/* HEADER */}
      <div className="mb-8">

        <h2 className="text-5xl font-bold text-[#243847]">

          Reservas 📅

        </h2>

        <p className="text-gray-600 mt-3 text-lg">

          Gestión visual de citas

        </p>

      </div>

      {/* LEYENDA */}
      <div className="flex flex-wrap gap-4 mb-6">

        {workers.map((worker) => (

          <div
            key={worker.id}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow"
          >

            <div
              className="w-5 h-5 rounded-full"
              style={{
                backgroundColor:
                worker.color?.startsWith("#")
                  ? worker.color
                  : "#243847",
              }}
            />

            <span className="font-medium text-[#243847]">

              {worker.name}

            </span>

          </div>

        ))}

      </div>


      {/* CALENDARIO */}
      <div className="bg-white p-6 rounded-3xl shadow-xl">

        <FullCalendar

          locale={esLocale}

          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
          ]}

          initialView="timeGridWeek"

          height="auto"

          slotMinTime="09:00:00"

          slotMaxTime="21:00:00"

          allDaySlot={false}

          editable={true}

          selectable={true}

          weekends={true}

          nowIndicator={true}

          // CREAR
          select={(info) => {

            setEditingAppointmentId(
              null
            );

            setSelectedDate(
              info.startStr
            );

            setShowModal(true);

          }}

          // EDITAR
          eventClick={(info) => {

            const appointment =
              info.event
                .extendedProps;

            setEditingAppointmentId(
              appointment.id
            );

            setClientId(
              appointment.client_id?.toString()
            );

            setServiceId(
              appointment.service_id?.toString()
            );

            setWorkerId(
              appointment.worker_id?.toString()
            );

            setBranchId(
              appointment.branch_id?.toString()
            );

            setSelectedDate(
              info.event.start?.toISOString() ||
                ""
            );

            setShowModal(true);

          }}

            // DRAG & DROP
eventDrop={async (info) => {

  const event =
    info.event;

  const start =
    event.start;

  const end =
    event.end;

  if (
    !start ||
    !end
  ) return;

  const appointmentDate =
    start
      .toISOString()
      .split("T")[0];

  const startTime =
    start
      .toTimeString()
      .slice(0, 5);

  const endTime =
    end
      .toTimeString()
      .slice(0, 5);

  const workerId =
    event.extendedProps
      .worker_id;

  // VALIDAR CRUCE
  const { data: conflicts } =
    await supabase

      .from(
        "appointments"
      )

      .select("*")

      .eq(
        "worker_id",
        workerId
      )

      .eq(
        "appointment_date",
        appointmentDate
      )

      .neq(
        "id",
        Number(event.id)
      );

  const hasConflict =
    conflicts?.some(
      (appt: any) => {

        const newStart =
          new Date(
            `2000-01-01T${startTime}`
          );

        const newEnd =
          new Date(
            `2000-01-01T${endTime}`
          );

        const existingStart =
          new Date(
            `2000-01-01T${appt.start_time}`
          );

        const existingEnd =
          new Date(
            `2000-01-01T${appt.end_time}`
          );

        return (

          newStart <
            existingEnd

          &&

          newEnd >
            existingStart

        );
      }
    );

  if (hasConflict) {

    alert(
      "La trabajadora ya tiene una reserva en ese horario"
    );

    info.revert();

    return;
  }

  const { error } =
    await supabase

      .from(
        "appointments"
      )

      .update({

        appointment_date:
          appointmentDate,

        start_time:
          startTime,

        end_time:
          endTime,

      })

      .eq(
        "id",
        Number(event.id)
      );

  if (error) {

    console.log(error);

    alert(
      "Error al mover reserva"
    );

    info.revert();

    return;
  }

  alert(
    "Reserva actualizada"
  );

}}

          // RESIZE
          eventResize={async (info) => {

            const event =
              info.event;

            const start =
              event.start;

            const end =
              event.end;

            if (
              !start ||
              !end
            ) return;

            const { error } =
              await supabase

                .from(
                  "appointments"
                )

                .update({

                  appointment_date:
                    start
                      .toISOString()
                      .split("T")[0],

                  start_time:
                    start
                      .toTimeString()
                      .slice(0, 5),

                  end_time:
                    end
                      .toTimeString()
                      .slice(0, 5),

                })

                .eq(
                  "id",
                  Number(event.id)
                );

            if (error) {

              console.log(error);

              alert(
                "Error al actualizar duración"
              );

              info.revert();

              return;
            }

            alert(
              "Duración actualizada"
            );

          }}

          headerToolbar={{

            left:
              "prev,next today",

            center:
              "title",

            right:
              "dayGridMonth,timeGridWeek,timeGridDay",

          }}

          buttonText={{

            today: "Hoy",

            month: "Mes",

            week: "Semana",

            day: "Día",

          }}

          events={events}

        />

      </div>

      {/* MODAL */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-8 rounded-3xl w-[500px] shadow-2xl">

            <h3 className="text-2xl font-bold text-[#243847] mb-6">

              {editingAppointmentId
                ? "Editar Reserva"
                : "Nueva Reserva"}

            </h3>

            <div className="space-y-4">

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
                  Seleccionar cliente
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

              {/* SERVICIO */}
              <select
                value={serviceId}
                onChange={(e) =>
                  setServiceId(
                    e.target.value
                  )
                }
                className="w-full border p-4 rounded-2xl"
              >

                <option value="">
                  Seleccionar servicio
                </option>

                {services.map((service) => (

                  <option
                    key={service.id}
                    value={service.id}
                  >

                    {service.name}

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

              {/* SEDE */}
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
                  saveAppointment
                }
                className="bg-[#243847] text-white px-5 py-3 rounded-2xl"
              >

                {editingAppointmentId
                  ? "Actualizar"
                  : "Guardar Reserva"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}