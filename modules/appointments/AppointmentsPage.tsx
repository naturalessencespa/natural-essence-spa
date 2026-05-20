"use client";

import { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";

import timeGridPlugin from "@fullcalendar/timegrid";

import interactionPlugin from "@fullcalendar/interaction";

import esLocale from "@fullcalendar/core/locales/es";

import { supabase } from "@/lib/supabase";

export default function AppointmentsPage() {

  const [events, setEvents] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingAppointmentId,
    setEditingAppointmentId] =
    useState<number | null>(null);

  const [clientId, setClientId] =
    useState("");

  const [serviceId, setServiceId] =
    useState("");

  const [workerId, setWorkerId] =
    useState("");

  const [branchId, setBranchId] =
    useState("");

  const [clients, setClients] =
    useState<any[]>([]);

  const [services, setServices] =
    useState<any[]>([]);

  const [workers, setWorkers] =
    useState<any[]>([]);

  const [branches, setBranches] =
    useState<any[]>([]);

  // OBTENER CITAS
  const fetchAppointments = async () => {

    const { data, error } = await supabase

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

    const formattedEvents = (data || []).map(
      (appointment) => ({

        id: appointment.id,

        title:
          appointment.clients?.full_name +
          " - " +
          appointment.services?.name +
          " - " +
          appointment.workers?.name,

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
        appointment.workers?.color ||
        "#243847",

      borderColor:
        appointment.workers?.color ||
        "#243847",

        extendedProps: {
          id: appointment.id,
          client_id: appointment.client_id,
          service_id: appointment.service_id,
          worker_id: appointment.worker_id,
          branch_id: appointment.branch_id,
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
        .select("*");

    const { data: servicesData } =
      await supabase
        .from("services")
        .select("*");

    const { data: workersData } =
      await supabase
        .from("workers")
        .select("*");

    const { data: branchesData } =
      await supabase
        .from("branches")
        .select("*");

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

      alert("Completa todos los campos");

      return;
    }

    const start = new Date(selectedDate);

    const end = new Date(start);

    end.setHours(end.getHours() + 1);

    // VALIDAR SOLAPAMIENTO
    const { data: existingAppointments } =
      await supabase

        .from("appointments")

        .select("*")

        .eq(
          "worker_id",
          parseInt(workerId)
        )

        .eq(
          "appointment_date",
          start.toISOString().split("T")[0]
        )

        .gte(
          "end_time",
          start.toTimeString().slice(0, 5)
        )

        .lte(
          "start_time",
          end.toTimeString().slice(0, 5)
        );

    const filteredAppointments =
      existingAppointments?.filter(
        (appointment) =>
          appointment.id !==
          editingAppointmentId
      );

    if (
      filteredAppointments &&
      filteredAppointments.length > 0
    ) {

      alert(
        "La trabajadora ya tiene una reserva en ese horario"
      );

      return;
    }

    // EDITAR
    if (editingAppointmentId) {

      const { error } = await supabase

        .from("appointments")

        .update({

          client_id:
            parseInt(clientId),

          service_id:
            parseInt(serviceId),

          worker_id:
            parseInt(workerId),

          branch_id:
            parseInt(branchId),

          appointment_date:
            start.toISOString().split("T")[0],

          start_time:
            start.toTimeString().slice(0, 5),

          end_time:
            end.toTimeString().slice(0, 5),

        })

        .eq(
          "id",
          editingAppointmentId
        );

      if (error) {

        console.log(error);

        alert("Error al editar");

        return;
      }

      alert("Reserva actualizada");

    } else {

      // CREAR
      const { error } = await supabase

        .from("appointments")

        .insert([
          {

            client_id:
              parseInt(clientId),

            service_id:
              parseInt(serviceId),

            worker_id:
              parseInt(workerId),

            branch_id:
              parseInt(branchId),

            appointment_date:
              start.toISOString().split("T")[0],

            start_time:
              start.toTimeString().slice(0, 5),

            end_time:
              end.toTimeString().slice(0, 5),

            status: "confirmed",

            notes: "",

          },
        ]);

      if (error) {

        console.log(error);

        alert("Error al guardar");

        return;
      }

      alert("Reserva guardada");
    }

    setShowModal(false);

    setEditingAppointmentId(null);

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

      {/* LEYENDA TRABAJADORAS */}
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
                    worker.color ||
                    "#243847"
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
              info.event.extendedProps;

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
              info.event.start?.toISOString() || ""
            );

            setShowModal(true);

          }}

          // DRAG & DROP
          eventDrop={async (info) => {

            const event = info.event;

            const start = event.start;

            const end = event.end;

            if (!start || !end) return;

            const { error } = await supabase

              .from("appointments")

              .update({

                appointment_date:
                  start.toISOString().split("T")[0],

                start_time:
                  start.toTimeString().slice(0, 5),

                end_time:
                  end.toTimeString().slice(0, 5),

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

            const event = info.event;

            const start = event.start;

            const end = event.end;

            if (!start || !end) return;

            const { error } = await supabase

              .from("appointments")

              .update({

                appointment_date:
                  start.toISOString().split("T")[0],

                start_time:
                  start.toTimeString().slice(0, 5),

                end_time:
                  end.toTimeString().slice(0, 5),

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
            left: "prev,next today",
            center: "title",
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
                onClick={saveAppointment}
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