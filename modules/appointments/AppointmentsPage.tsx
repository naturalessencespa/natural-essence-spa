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
        workers(name)
      `);

    if (error) {

      console.log(error);

      return;
    }

    const formattedEvents = (data || []).map(
      (appointment) => ({

        title:
          appointment.clients?.full_name +
          " - " +
          appointment.services?.name,

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

        backgroundColor: "#243847",

        borderColor: "#243847",

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

  // GUARDAR CITA
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

    const { error } = await supabase

      .from("appointments")

      .insert([
        {

          client_id: parseInt(clientId),

          service_id: parseInt(serviceId),

          worker_id: parseInt(workerId),

          branch_id: parseInt(branchId),

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

      alert("Error al guardar reserva");

      return;
    }

    alert("Reserva guardada");

    setShowModal(false);

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

          select={(info) => {

            setSelectedDate(info.startStr);

            setShowModal(true);

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

              Nueva Reserva

            </h3>

            <div className="space-y-4">

              {/* CLIENTE */}
              <select
                value={clientId}
                onChange={(e) =>
                  setClientId(e.target.value)
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
                  setServiceId(e.target.value)
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
                  setWorkerId(e.target.value)
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
                  setBranchId(e.target.value)
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

                Guardar Reserva

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}