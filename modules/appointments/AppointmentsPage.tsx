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

  // OBTENER CITAS
  const fetchAppointments = async () => {

    const { data, error } = await supabase

      .from("appointments")

      .select("*");

    if (!error && data) {

      const formattedEvents = data.map(
        (appointment) => ({

          title: "Reserva",

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

        })
      );

      setEvents(formattedEvents);

    } else {

      console.log(error);

    }
  };

  // CARGAR
  useEffect(() => {

    fetchAppointments();

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

            <h3 className="text-2xl font-bold text-[#243847] mb-4">

              Nueva Reserva

            </h3>

            <p className="mb-6 text-gray-600">

              Fecha seleccionada:

              <br />

              {selectedDate}

            </p>

            <div className="flex gap-4">

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 px-5 py-3 rounded-2xl"
              >

                Cancelar

              </button>

              <button
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