  "use client";

  import { useEffect, useMemo, useState } from "react";

  import Select from "react-select";

  import {
    Pencil,
    Trash2
  } from "lucide-react";

  import { supabase } from "@/lib/supabase";

  export default function PackagesPage() {

    const [packages, setPackages] =
      useState<any[]>([]);

    const [clients, setClients] =
      useState<any[]>([]);

    const [services, setServices] =
      useState<any[]>([]);

    const [laserZones, setLaserZones] =
      useState<any[]>([]);

    const [showModal, setShowModal] =
      useState(false);

    const [editingId,
      setEditingId] =
      useState<number | null>(
        null
      );

    const [clientId, setClientId] =
      useState("");

    const [serviceId, setServiceId] =
      useState("");

    const [workerId, setWorkerId] =
      useState("");

    const [workers, setWorkers] =
      useState<any[]>([]);

    const [startDate,
      setStartDate] =
      useState("");

    const [startTime,
      setStartTime] =
      useState("");

        const [
  sessionFrequency,
  setSessionFrequency
] = useState(30);

    const [selectedZones,
      setSelectedZones] =
      useState<any[]>([]);

    const [totalSessions,
      setTotalSessions] =
      useState(1);

    const [unitPrice,
      setUnitPrice] =
      useState(0);

      const [
  manualPackagePrice,
  setManualPackagePrice
] = useState(0);

    const [discountPercentage,
      setDiscountPercentage] =
      useState(0);

    const [notes, setNotes] =
      useState("");

      const [savedSubtotal,
    setSavedSubtotal] =
    useState(0);

  const [savedTotalPrice,
    setSavedTotalPrice] =
    useState(0);

    // BUSCADOR
    const [searchClient,
      setSearchClient] =
      useState("");

    // ORDEN
    const [sortBy,
      setSortBy] =
      useState("date_desc");

    // MODAL ZONAS
    const [showZonesModal,
      setShowZonesModal] =
      useState(false);

    const [zonesDetail,
      setZonesDetail] =
      useState<any[]>([]);

    // MODAL SESIONES
    const [showSessionsModal,
      setShowSessionsModal] =
      useState(false);

    const [sessionsDetail,
      setSessionsDetail] =
      useState<any[]>([]);

    const [upcomingSessions,
    setUpcomingSessions] =
    useState<any[]>([]);

    const [selectedPackage, setSelectedPackage] =
    useState<any>(null);

  const [
    showScheduleSessionModal,
    setShowScheduleSessionModal
  ] = useState(false);

  const [
    selectedSession,
    setSelectedSession
  ] = useState<any>(null);

  const [
    scheduleDate,
    setScheduleDate
  ] = useState("");

  const [
    scheduleTime,
    setScheduleTime
  ] = useState("");

  const [
    additionalSessions,
    setAdditionalSessions
  ] = useState(1);

  const [
    additionalSessionPrice,
    setAdditionalSessionPrice
  ] = useState(0);

  const [
    showAddSessionsModal,
    setShowAddSessionsModal
  ] = useState(false);

  const selectedService =
  services.find(
    (service) =>
      service.id ===
      Number(serviceId)
  );

const isLaser =
  selectedService?.name ===
  "Depilación Láser";

    // SUBTOTAL
  const subtotal =
    useMemo(() => {

      if (editingId) {

        return savedSubtotal;

      }

      return (
        unitPrice *
        totalSessions
      );

    }, [

      
      unitPrice,
      totalSessions,
      editingId,
      savedSubtotal
    ]);

    useEffect(() => {

  if (
    !isLaser
  ) {

    setManualPackagePrice(
      subtotal
    );

  }

}, [
  subtotal,
  isLaser
]);

    // DESCUENTO AUTOMÁTICO
 const automaticDiscount =
  useMemo(() => {

    if (!isLaser) {
      return 0;
    }

    if (
      totalSessions === 3
    ) {
      return 10;
    }

    if (
      totalSessions === 6
    ) {
      return 15;
    }

    return 0;

  }, [
    totalSessions,
    isLaser
  ]);

    // PRECIO PAQUETE
  const packagePrice =
  useMemo(() => {

    if (!isLaser) {
      return subtotal;
    }

    if (
      totalSessions === 3
    ) {
      return (
        subtotal * 0.90
      );
    }

    if (
      totalSessions === 6
    ) {
      return (
        subtotal * 0.85
      );
    }

    return subtotal;

  }, [
    subtotal,
    totalSessions,
    isLaser
  ]);

    // TOTAL FINAL
  const totalPrice =
  useMemo(() => {

    if (editingId) {

      return savedTotalPrice;

    }

    if (!isLaser) {

      return manualPackagePrice;

    }

    const extraDiscount =
      packagePrice *
      (
        discountPercentage /
        100
      );

    return (
      packagePrice -
      extraDiscount
    );

  }, [
    packagePrice,
    discountPercentage,
    editingId,
    savedTotalPrice,
    isLaser,
    manualPackagePrice
  ]);
    // OBTENER PAQUETES
    const fetchPackages =
      async () => {

        const { data, error } =
          await supabase

            .from(
              "client_packages"
            )

            .select(`
              *,
              clients(full_name),
              services(name)
            `)

            .eq(
              "active",
              true
            );

        if (error) {

          console.log(error);

          return;
        }

        setPackages(data || []);
      };

    // OBTENER DATOS
    const fetchData =
      async () => {

        const {
          data: clientsData,
        } = await supabase

          .from("clients")

          .select("*")

          .eq(
            "active",
            true
          );

        const {
          data: servicesData,
        } = await supabase

          .from("services")

          .select("*")

          .eq(
            "allow_packages",
            true
          );

        const {
          data: zonesData,
        } = await supabase

          .from("laser_zones")

          .select("*")

          .eq(
            "active",
            true
          );

          const {
              data: workersData,
            } = await supabase

              .from("workers")

              .select("*")

              .eq(
                "active",
                true
              );

        setClients(
          clientsData || []
        );

        setServices(
          servicesData || []
        );

        setLaserZones(
          zonesData || []
        );

        setWorkers(
          workersData || []
        );
      };

    // GUARDAR
    const savePackage =
      async () => {

        if (
          !clientId ||
          !serviceId ||
          !startDate ||
          !startTime
        ) {

          alert(
            "Completa cliente, servicio y fecha"
          );

          return;
        }

        // EDITAR
        if (editingId) {

          const { error } =
            await supabase

              .from(
                "client_packages"
              )

              .update({

                client_id:
                  parseInt(
                    clientId
                  ),

                service_id:
                  parseInt(
                    serviceId
                  ),

                start_date:
                  startDate,
              
                start_time:
                  startTime,

                total_sessions:
                  totalSessions,

                session_frequency:
                  sessionFrequency,

                unit_price:
                  unitPrice,

                subtotal,

                discount_percentage:
                  discountPercentage,

                total_price:
                  totalPrice,

                notes,

              })

              .eq(
                "id",
                editingId
              );

          if (error) {

            console.log(error);

            alert(
              "Error al actualizar"
            );

            return;
          }

          // BORRAR ZONAS
          await supabase

            .from(
              "client_package_zones"
            )

            .delete()

            .eq(
              "package_id",
              editingId
            );

          // REINSERTAR
          if (
            selectedZones.length > 0
          ) {

            const zonesToInsert =
              selectedZones.map(
                (zone) => ({

                  package_id:
                    editingId,

                  laser_zone_id:
                    zone.value,

                })
              );

            await supabase

              .from(
                "client_package_zones"
              )

              .insert(
                zonesToInsert
              );
          }

          alert(
            "Paquete actualizado"
          );

        } else {

          // CREAR
          const {
            data,
            error,
          } = await supabase

            .from(
              "client_packages"
            )

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
                  parseInt(workerId),

                start_date:
                  startDate,

                start_time:
                  startTime,

                total_sessions:
                  totalSessions,
                
                session_frequency:
                  sessionFrequency,

                quantity: 1,

                unit_price:
                  unitPrice,

                subtotal,

                discount_percentage:
                  discountPercentage,

                total_price:
                  totalPrice,

                notes,

                active: true,

              },
            ])

            .select()

            .single();

          if (error) {

            console.log(error);

            alert(
              "Error al guardar"
            );

            return;
          }

          // GUARDAR ZONAS
          if (
            selectedZones.length > 0
          ) {

            const zonesToInsert =
              selectedZones.map(
                (zone) => ({

                  package_id:
                    data.id,

                  laser_zone_id:
                    zone.value,

                })
              );

            await supabase

              .from(
                "client_package_zones"
              )

              .insert(
                zonesToInsert
              );
          }

        

          // GENERAR SESIONES
          const sessionsToInsert = [];

          for (
            let i = 0;
            i < totalSessions;
            i++
          ) {

            const sessionDate =
  new Date(startDate);

sessionDate.setDate(
  sessionDate.getDate() +
  (i * sessionFrequency)
);

            sessionsToInsert.push({

              package_id:
                data.id,

              session_number:
                i + 1,

              scheduled_date:
                sessionDate
                  .toISOString()
                  .split("T")[0],
              
              scheduled_time:
                  startTime,

              completed:
                false,

            });
          }

          await supabase

            .from(
              "package_sessions"
            )

            .insert(
              sessionsToInsert
            );

            // CREAR CITA AUTOMATICA
  console.log(
    "SELECTED ZONES",
    selectedZones
  );

  const zonesText =
    selectedZones.length > 0

      ? selectedZones
          .map((zone) =>
    zone.label.split(" - ")[0]
  )
          .join(", ")

      : "SIN ZONAS";

  // CREAR CITA AUTOMATICA

  const {
    data: appointmentData,
    error: appointmentError,
  } = await supabase

    .from("appointments")

    .insert([
      {
        client_id: parseInt(clientId),
        service_id: parseInt(serviceId),
        worker_id: parseInt(workerId),

        branch_id: 1,

        appointment_date: startDate,
        start_time: startTime,
        end_time: startTime,

        status: "Pendiente",

        final_price: totalPrice,

        notes: zonesText,
      },
    ])

    .select()

    .single();

  if (appointmentError) {

    console.log(
      appointmentError
    );

    return;
  }

  console.log(
    "PACKAGE ID:",
    data?.id
  );

  console.log(
    "APPOINTMENT ID:",
    appointmentData?.id
  );

  const { error: updateError } =
    await supabase

      .from("client_packages")

      .update({

        appointment_id:
          appointmentData?.id,

      })

      .eq(
        "id",
        data?.id
      );

      await supabase

    .from("package_sessions")

    .update({

      appointment_id:
        appointmentData.id

    })

    .eq(
      "package_id",
      data.id
    )

    .eq(
      "session_number",
      1
    );

  console.log(
    "UPDATE ERROR:",
    updateError
  );
          alert(
            "Paquete creado"
          );
        }

        // LIMPIAR
        setShowModal(false);

        setEditingId(null);

        setClientId("");

        setServiceId("");

        setStartDate("");

        setStartTime("");

        setSelectedZones([]);

        setTotalSessions(1);

        setSessionFrequency(30);

        setUnitPrice(0);

        setDiscountPercentage(0);

        setNotes("");

        fetchPackages();
      };

    // ELIMINAR
  const deletePackage =
    async (id: number) => {

      const confirmDelete =
        confirm(
          "¿Eliminar paquete?"
        );

      if (!confirmDelete)
        return;

      const { data: pkg } =
        await supabase

          .from(
            "client_packages"
          )

          .select("*")

          .eq(
            "id",
            id
          )

          .single();

      if (!pkg)
        return;

      if (
        pkg.appointment_id
      ) {

    const {
    error: deleteAppointmentError
  } = await supabase

    .from(
      "appointments"
    )

    .delete()

    .eq(
      "id",
      pkg.appointment_id
    );

    const { data: verifyAppointment } =
    await supabase

      .from("appointments")

      .select("id")

      .eq(
        "id",
        pkg.appointment_id
      );

  console.log(
    "VERIFY AFTER DELETE:",
    verifyAppointment
  );

  console.log(
    "DELETE APPOINTMENT:",
    pkg.appointment_id
  );

  console.log(
    "DELETE ERROR:",
    deleteAppointmentError
  );

      }

      const { data: packageSessions } =
  await supabase

    .from("package_sessions")

    .select("appointment_id")

    .eq(
      "package_id",
      id
    );

if (packageSessions) {

  const appointmentIds =
    packageSessions

      .filter(
        (s) => s.appointment_id
      )

      .map(
        (s) => s.appointment_id
      );

  if (
    appointmentIds.length > 0
  ) {

    await supabase

      .from("appointments")

      .delete()

      .in(
        "id",
        appointmentIds
      );

  }

}

      await supabase

        .from(
          "package_sessions"
        )

        .delete()

        .eq(
          "package_id",
          id
        );

      await supabase

        .from(
          "client_package_zones"
        )

        .delete()

        .eq(
          "package_id",
          id
        );

      await supabase

        .from(
          "client_packages"
        )

        .delete()

        .eq(
          "id",
          id
        );

      fetchPackages();

      alert(
        "Paquete eliminado"
      );

    };
    
    // ACTUALIZAR SESION
  // ACTUALIZAR SESION
  const updateSession =
    async (
      session: any
    ) => {

      const attendedDate =
        prompt(
          "Fecha atendida (YYYY-MM-DD)",
          session.scheduled_date
        );

      if (!attendedDate)
        return;

      // ACTUALIZAR SESION ACTUAL
      const { error } =
        await supabase

          .from(
            "package_sessions"
          )

          .update({

            completed: true,

            attended_date:
              attendedDate,

            completed_at:
              new Date()
                .toISOString(),

            scheduled_date:
              attendedDate,

          })

          .eq(
            "id",
            session.id
          );

      if (error) {

        console.log(error);

        alert(
          "Error actualizando sesión"
        );

        return;
      }

      // OBTENER FUTURAS
const { data: futureSessions } =
  await supabase

    .from(
      "package_sessions"
    )

    .select("*")

    .eq(
      "package_id",
      session.package_id
    )

    .gt(
      "session_number",
      session.session_number
    )

    .order(
      "session_number"
    );

if (futureSessions) {

  const { data: packageData } =
    await supabase

      .from(
        "client_packages"
      )

      .select(
        "session_frequency"
      )

      .eq(
        "id",
        session.package_id
      )

      .single();

  const frequency =
    Number(
      packageData?.session_frequency || 30
    );

  for (
    let i = 0;
    i < futureSessions.length;
    i++
  ) {

    const future =
      futureSessions[i];

    const newDate =
      new Date(
        attendedDate
      );

    newDate.setDate(
      newDate.getDate() +
      (frequency * (i + 1))
    );

    await supabase

      .from(
        "package_sessions"
      )

      .update({

        scheduled_date:
          newDate
            .toISOString()
            .split("T")[0],

      })

      .eq(
        "id",
        future.id
      );
  }
}
      // RECARGAR SESIONES
      const { data } =
        await supabase

          .from(
            "package_sessions"
          )

          .select("*")

          .eq(
            "package_id",
            session.package_id
          )

          .order(
            "session_number"
          );

      if (data) {

        setSessionsDetail(
          data
        );
      }
    };

    // PROXIMAS CITAS
  const fetchUpcomingSessions =
    async () => {

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const nextWeek =
          new Date();

          nextWeek.setDate(
          nextWeek.getDate() + 7
          );

          const nextWeekDate =
          nextWeek
              .toISOString()
              .split("T")[0];

      const { data, error } =
        await supabase

          .from(
            "package_sessions"
          )

          .select(`
            *,
            client_packages(
              clients(full_name)
            )
          `)

          .eq(
            "completed",
            false
          )

          .gte(
            "scheduled_date",
            today
          )

          .lte(
          "scheduled_date",
          nextWeekDate
          )

          .order(
            "scheduled_date",
            {
              ascending: true
            }
          )

          .limit(10);

      if (!error && data) {

        setUpcomingSessions(
          data
        );
      }
    };

    useEffect(() => {

      fetchPackages();

      fetchData();

      fetchUpcomingSessions();

    }, []);

    const addSessionsToPackage =
      async () => {

        if (!selectedPackage) {

          return;

        }

        const { data: sessions } =
          await supabase

            .from(
              "package_sessions"
            )

            .select("*")

            .eq(
              "package_id",
              selectedPackage.id
            )

            .order(
              "session_number",
              {
                ascending: false
              }
            )

            .limit(1);

        if (
          !sessions ||
          sessions.length === 0
        ) {

          return;

        }

      const lastSession =
        sessions[0];

      const sessionsToInsert = [];

      for (
        let i = 1;
        i <= additionalSessions;
        i++
      ) {

        const nextDate =
  new Date(
    lastSession.scheduled_date
  );

nextDate.setDate(
  nextDate.getDate() +
  (
    Number(
      selectedPackage?.session_frequency || 30
    ) * i
  )
);

        sessionsToInsert.push({

          package_id:
            selectedPackage.id,

          session_number:
            lastSession.session_number + i,

          scheduled_date:
            nextDate
              .toISOString()
              .split("T")[0],

          scheduled_time:
            lastSession.scheduled_time,

          completed:
            false,

        });

      }

      const { error } =
        await supabase

          .from(
            "package_sessions"
          )

          .insert(
            sessionsToInsert
          );

      if (error) {

        console.log(error);

        alert(
          "Error agregando sesiones"
        );

        return;

      }

    const basePrice =
  Number(selectedPackage.unit_price);

let newAmount =
  basePrice *
  additionalSessions;

if (additionalSessions === 3) {

  newAmount =
    newAmount * 0.90;

}

if (additionalSessions === 6) {

  newAmount =
    newAmount * 0.85;

}

await supabase
  .from("client_packages")
  .update({

    total_sessions:
      selectedPackage.total_sessions +
      additionalSessions,

    total_price:
      Number(selectedPackage.total_price) +
      newAmount

  })

    .eq(
      "id",
      selectedPackage.id
    );

      alert(
        "Sesiones agregadas"
      );

      setShowAddSessionsModal(
        false
      );

      fetchPackages();

    };

    const updateSessionField =
    async (
      sessionId: number,
      field: string,
      value: string
    ) => {

      const { error } =
        await supabase

          .from(
            "package_sessions"
          )

          .update({
            [field]: value,
          })

          .eq(
            "id",
            sessionId
          );

      if (error) {

        console.log(error);

        alert(
          "Error al guardar"
        );

        return;
      }

      fetchPackages();
    };

    const scheduleSession =
    async () => {

      if (
        !selectedSession ||
        !selectedPackage
      ) {

        return;

      }

      const {
        data: appointment,
        error: appointmentError
      } =
        await supabase

          .from("appointments")

          .insert([
            {

              client_id:
                selectedPackage.client_id,

              service_id:
                selectedPackage.service_id,

              worker_id: selectedPackage.worker_id,
              
              branch_id: 1,

              appointment_date:
                scheduleDate,

              start_time:
                scheduleTime,

              end_time:
                scheduleTime,

              status:
                "Pendiente",

              final_price: 0,

              notes:
                "Sesión de paquete"

            }
          ])

          .select()

          .single();

      if (
        appointmentError
      ) {

        console.log(
          appointmentError
        );

        alert(
          "Error creando reserva"
        );

        return;

      }

      const {
        error:
          sessionError
      } =
        await supabase

          .from(
            "package_sessions"
          )

          .update({

            appointment_id:
              appointment.id,

            scheduled_date:
              scheduleDate,

            scheduled_time:
              scheduleTime

          })

          .eq(
            "id",
            selectedSession.id
          );

      if (
        sessionError
      ) {

        console.log(
          sessionError
        );

        alert(
          "Error actualizando sesión"
        );

        return;

      }

      alert(
        "Reserva creada"
      );

      setShowScheduleSessionModal(
        false
      );

      const { data } =
        await supabase

          .from(
            "package_sessions"
          )

          .select("*")

          .eq(
            "package_id",
            selectedPackage.id
          )

          .order(
            "session_number"
          );

      setSessionsDetail(
        data || []
      );

    };

 const sessionOptions = isLaser
  ? [1, 3, 6]
  : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

if (
  totalSessions &&
  !sessionOptions.includes(totalSessions)
) {
  sessionOptions.push(totalSessions);
}
  
    return (

      <div>

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">

          <div>

            <h2 className="text-5xl font-bold text-[#243847]">

              Paquetes 🎯

            </h2>

            <p className="text-gray-600 mt-2">

              Gestión de paquetes

            </p>

          </div>

          <button
        onClick={() => {

  setEditingId(null);

  setClientId("");
  setServiceId("");

  setStartDate("");
  setStartTime("");

  setSelectedZones([]);

  setTotalSessions(1);

  setSessionFrequency(30);

  setUnitPrice(0);

  setDiscountPercentage(0);

  setNotes("");

  setSavedSubtotal(0);
  setSavedTotalPrice(0);

  setShowModal(true);

}}
            className="bg-[#243847] text-white px-6 py-4 rounded-2xl"
          >

            + Nuevo paquete

          </button>

        </div>

        {/* FILTROS */}
        <div className="flex gap-4 mb-6">

          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchClient}
            onChange={(e) =>
              setSearchClient(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl w-[350px]"
          />

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl"
          >

            <option value="date_desc">
              Fecha reciente
            </option>

            <option value="date_asc">
              Fecha antigua
            </option>

            <option value="client_asc">
              Cliente A-Z
            </option>

          </select>

        </div>

        {/* PROXIMAS CITAS */}
  <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">

    <h3 className="text-2xl font-bold text-[#243847] mb-5">

      📅 Próximas sesiones pendientes

    </h3>

    <div className="space-y-4">

      {upcomingSessions.map(
        (session: any) => (

          <div
            key={session.id}
            className="border rounded-2xl p-4 flex items-center justify-between"
          >

            <div>

              <p className="font-bold text-[#243847]">

                {
                  session
                    ?.client_packages
                    ?.clients
                    ?.full_name
                }

              </p>

              <p className="text-gray-500">

                Sesión #
                {
                  session.session_number
                }

              </p>

            </div>

            <div className="text-right">

              <p className="font-bold">

                {
                  session.scheduled_date
                }

              </p>

              <p className="text-orange-500 text-sm">

                Pendiente

              </p>

            </div>

          </div>

        )
      )}

    </div>

  </div>

        {/* TABLA */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <table className="w-full min-w-[1000px]">

            <thead className="bg-[#243847] text-white">

              <tr>

                <th className="text-left p-5">
                  Cliente
                </th>

                <th className="text-left p-5">
                  Servicio
                </th>

                <th className="text-left p-5">
                  Zonas
                </th>

                <th className="text-left p-5">
                  Primera atención
                </th>

                <th className="text-left p-5">
                  Sesiones
                </th>

                <th className="text-left p-5">
                  Programación
                </th>

                <th className="text-left p-5">
                  Total
                </th>

                <th className="text-left p-5">
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody>

              {[...packages]

                .filter((pkg) =>

                  pkg.clients
                    ?.full_name
                    ?.toLowerCase()

                    .includes(
                      searchClient.toLowerCase()
                    )
                )

                .sort((a, b) => {

                  if (
                    sortBy === "client_asc"
                  ) {

                    return a.clients?.full_name.localeCompare(
                      b.clients?.full_name
                    );
                  }

                  if (
                    sortBy === "date_asc"
                  ) {

                    return new Date(
                      a.start_date
                    ).getTime()

                      -

                      new Date(
                        b.start_date
                      ).getTime();
                  }

                  return new Date(
                    b.start_date
                  ).getTime()

                    -

                    new Date(
                      a.start_date
                    ).getTime();
                })

                .map((pkg) => (

                  <tr
                    key={pkg.id}
                    className="border-b"
                  >

                    <td className="p-5">
                      {
                        pkg.clients
                          ?.full_name
                      }
                    </td>

                    <td className="p-5">
                      {
                        pkg.services
                          ?.name
                      }
                    </td>

                    {/* ZONAS */}
                    <td className="p-5">

                      <button
                        onClick={async () => {

                          const { data } =
                            await supabase

                              .from(
                                "client_package_zones"
                              )

                              .select(`
                                laser_zones(
                                  name,
                                  price
                                )
                              `)

                              .eq(
                                "package_id",
                                pkg.id
                              );

                          if (data) {

                            setZonesDetail(
                              data
                            );

                            setShowZonesModal(
                              true
                            );
                          }
                        }}
                        className="bg-[#243847] text-white px-4 py-2 rounded-xl text-sm"
                      >

                        Ver zonas

                      </button>

                    </td>

                    <td className="p-5">
                      {pkg.start_date}
                    </td>

                    <td className="p-5">
                      {pkg.total_sessions}
                    </td>

                    {/* PROGRAMACION */}
                    <td className="p-5">

                      <button
                        onClick={async () => {

                          const { data } =
                            await supabase

                              .from(
                                "package_sessions"
                              )

                              .select("*")

                              .eq(
                                "package_id",
                                pkg.id
                              )

                              .order(
                                "session_number"
                              );

                        if (data) {

                            setSelectedPackage(pkg);

                            setSessionsDetail(
                              data
                            );

                            setShowModal(false);

                            setShowSessionsModal(
                              true
                            );
                          }
                        }}
                        className="bg-[#243847] text-white px-4 py-2 rounded-xl text-sm"
                      >

                        Ver sesiones

                      </button>

                    </td>

                    <td className="p-5 font-bold">

                      S/
                      {
                        Number(
                          pkg.total_price
                        ).toFixed(2)
                      }

                    </td>

                    <td className="p-5">

                      <div className="flex gap-3">

                        <button
  onClick={() => {

    setSelectedPackage(pkg);

    setAdditionalSessions(1);

    setAdditionalSessionPrice(
      Number(pkg.total_price) /
      Number(pkg.total_sessions)
    );

    setShowAddSessionsModal(true);

  }}
    className="bg-green-100 p-3 rounded-xl hover:scale-105 transition"
  >

    ➕

  </button>

                        <button
                          onClick={async () => {

                            setEditingId(
                              pkg.id
                            );

                            setClientId(
                              String(
                                pkg.client_id
                              )
                            );

                            setServiceId(
                              String(
                                pkg.service_id
                              )
                            );

                            setStartDate(
                              pkg.start_date || ""
                            );

                            setStartTime(
  pkg.start_time || ""
);

setTotalSessions(
  Number(pkg.total_sessions)
);

setSessionFrequency(
  Number(
    pkg.session_frequency || 30
  )
);
   

                            setUnitPrice(
                              Number(
                                pkg.unit_price
                              )
                            );

                            setSavedSubtotal(
                              Number(pkg.subtotal || 0)
                            );

                            setSavedTotalPrice(
                              Number(pkg.total_price || 0)
                            );

                            setDiscountPercentage(
                              Number(
                                pkg.discount_percentage
                              )
                            );

                            setNotes(
                              pkg.notes || ""
                            );

                            const { data } =
                              await supabase

                                .from(
                                  "client_package_zones"
                                )

                                .select(`
                                  laser_zone_id,
                                  laser_zones(
                                    id,
                                    name,
                                    price
                                  )
                                `)

                                .eq(
                                  "package_id",
                                  pkg.id
                                );

                            if (data) {

                              const formatted =
                                data.map(
                                  (item: any) => ({

                                    value:
                                      item
                                        .laser_zones
                                        .id,

                                    label:
                                      `${item.laser_zones.name} - S/ ${item.laser_zones.price}`,

                                    price:
                                      item
                                        .laser_zones
                                        .price,

                                  })
                                );

                              setSelectedZones(
                                formatted
                              );
                            }

                            setShowModal(true);
                          }}
                          className="bg-blue-100 p-3 rounded-xl hover:scale-105 transition"
                        >

                          <Pencil size={18} />

                        </button>

                        <button
                          onClick={() =>
                            deletePackage(
                              pkg.id
                            )
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

        {/* MODAL PRINCIPAL */}
        {showModal && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">

            <div className="bg-white rounded-3xl w-full max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">

              <div className="bg-[#243847] text-white px-8 py-6">

                <h3 className="text-3xl font-bold">

                  {editingId
                    ? "Editar paquete"
                    : "Nuevo paquete"}

                </h3>

              </div>

              <div className="p-8 overflow-y-auto space-y-6">

                <div>

                  <label className="block mb-2 font-medium text-gray-700">
                    Cliente
                  </label>

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
                      Seleccione cliente
                    </option>

                    {clients.map(
                      (client) => (

                        <option
                          key={client.id}
                          value={client.id}
                        >

                          {
                            client.full_name
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>

                <div>

                  <label className="block mb-2 font-medium text-gray-700">
                    Servicio
                  </label>

                  <select
                    value={serviceId}
                    onChange={(e) => {

  setServiceId(
    e.target.value
  );

  const service =
    services.find(
      (s) =>
        s.id ===
        Number(
          e.target.value
        )
    );

  if (
    service &&
    service.name !==
      "Depilación Láser"
  ) {

    setUnitPrice(
      Number(
        service.price || 0
      )
    );

  }

}}
                    className="w-full border p-4 rounded-2xl"
                  >

                    <option value="">
                      Seleccione servicio
                    </option>

                    {services.map(
                      (service) => (

                        <option
                          key={service.id}
                          value={service.id}
                        >

                          {
                            service.name
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>

                <div>

                  <div>

  <label className="block mb-2 font-medium text-gray-700">
    Trabajadora
  </label>

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
      Seleccione trabajadora
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

</div>

                  <label className="block mb-2 font-medium text-gray-700">
                    Primera atención
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(
                        e.target.value
                      )
                    }
                    className="w-full border p-4 rounded-2xl"
                  />

                </div>

                <div className="mt-4">

                  <label className="block mb-2 font-medium text-gray-700">
                      Hora
                  </label>

                  <input
                      type="time"
                      value={startTime}
                      onChange={(e) =>
                      setStartTime(
                          e.target.value
                      )
                      }
                      className="w-full border p-4 rounded-2xl"
                  />

                  </div>

               {isLaser && (

<div>

  <label className="block mb-2 font-medium text-gray-700">
    Zonas láser
  </label>

  <Select
    isMulti
    options={laserZones.map(
      (zone) => ({
        value: zone.id,
        label: `${zone.name} - S/ ${zone.price}`,
        price: zone.price,
      })
    )}
    value={selectedZones}
    onChange={(selected: any) => {

      setSelectedZones(
        selected || []
      );

      const total =
        (
          selected || []
        ).reduce(
          (
            sum: number,
            item: any
          ) =>

            sum +
            Number(
              item.price || 0
            ),

          0
        );

      setUnitPrice(
        total
      );
    }}
    placeholder="Seleccionar zonas..."
  />

</div>

)}


                <div>

                  <label className="block mb-2 font-medium text-gray-700">
                    Número de sesiones
                  </label>

  <select
  value={totalSessions}
  onChange={(e) =>
    setTotalSessions(
      Number(e.target.value)
    )
  }
  className="w-full border p-4 rounded-2xl"
>
  {sessionOptions.map(
    (sessions) => (
      <option
        key={sessions}
        value={sessions}
      >
        {sessions} sesiones
      </option>
    )
  )}
</select>

{!isLaser &&
 totalSessions > 1 && (

<div>

  <label className="block mb-2 font-medium text-gray-700">
    Frecuencia entre sesiones (días)
  </label>

  <input
  type="number"
  min={1}
  value={sessionFrequency}
  onChange={(e) =>
    setSessionFrequency(
      Number(e.target.value)
    )
  }
  className="w-full border p-4 rounded-2xl"
  placeholder="Ej: 15"
/>
</div>

)}

                </div>

                <div>

                  <label className="block mb-2 font-medium text-gray-700">
                    Descuento adicional %
                  </label>

                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) =>
                      setDiscountPercentage(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full border p-4 rounded-2xl"
                  />

                </div>

                {!isLaser && (

                    <div>

                      <label className="block mb-2 font-medium text-gray-700">
                        Precio final del paquete
                      </label>

                      <input
                        type="number"
                        value={manualPackagePrice}
                        onChange={(e) =>
                          setManualPackagePrice(
                            Number(e.target.value)
                          )
                        }
                        className="w-full border p-4 rounded-2xl"
                      />

                    </div>

                  )}

                {!isLaser ? (

  <div className="bg-[#243847]/5 border-2 border-[#243847] rounded-3xl p-6 space-y-3">

<div className="flex justify-between">

  <span>
    Precio unitario
  </span>

  <span className="font-semibold">
    S/ {unitPrice.toFixed(2)}
  </span>

</div>

<div className="flex justify-between">

  <span>
    Sesiones
  </span>

  <span className="font-semibold">
    {totalSessions}
  </span>

</div>

<div className="flex justify-between">

  <span>
    Precio paquete
  </span>

  <span className="font-semibold">
    S/ {manualPackagePrice.toFixed(2)}
  </span>

</div>

<div className="border-t pt-4 flex justify-between items-center">

  <span className="text-xl font-bold text-[#243847]">
    TOTAL FINAL
  </span>

  <span className="text-3xl font-bold text-[#243847]">
    S/ {totalPrice.toFixed(2)}
  </span>

</div>

  </div>

) : (

  <div className="bg-[#243847]/5 border-2 border-[#243847] rounded-3xl p-6 space-y-3">


<div className="flex justify-between">

  <span>
    Subtotal
  </span>

  <span className="font-semibold">
    S/ {subtotal.toFixed(2)}
  </span>

</div>

<div className="flex justify-between">

  <span>
    Descuento automático
  </span>

  <span className="font-semibold text-green-600">
    - {automaticDiscount}%
  </span>

</div>

<div className="flex justify-between">

  <span>
    Precio paquete
  </span>

  <span className="font-semibold">
    S/ {packagePrice.toFixed(2)}
  </span>

</div>

<div className="flex justify-between">

  <span>
    Descuento adicional
  </span>

  <span className="font-semibold text-red-500">
    - {discountPercentage}%
  </span>

</div>

<div className="border-t pt-4 flex justify-between items-center">

  <span className="text-xl font-bold text-[#243847]">
    TOTAL FINAL
  </span>

  <span className="text-3xl font-bold text-[#243847]">
    S/ {totalPrice.toFixed(2)}
  </span>

</div>


  </div>

)}

                <div>

                  <textarea
                    placeholder="Observaciones"
                    value={notes}
                    onChange={(e) =>
                      setNotes(
                        e.target.value
                      )
                    }
                    className="w-full border p-4 rounded-2xl h-24"
                  />

                </div>

              </div>

              <div className="flex justify-end gap-4 p-8 border-t">

                <button
                 onClick={() => {

  setShowModal(false);

  setEditingId(null);

  setClientId("");
  setServiceId("");

  setStartDate("");
  setStartTime("");

  setSelectedZones([]);

  setTotalSessions(1);

  setSessionFrequency(30);

  setUnitPrice(0);

  setDiscountPercentage(0);

  setNotes("");

  setSavedSubtotal(0);
  setSavedTotalPrice(0);

}}
                  className="bg-gray-200 px-6 py-3 rounded-2xl"
                >

                  Cancelar

                </button>

                <button
                  onClick={savePackage}
                  className="bg-[#243847] text-white px-6 py-3 rounded-2xl"
                >

                  {editingId
                    ? "Actualizar paquete"
                    : "Guardar paquete"}

                </button>

              </div>

            </div>

          </div>

        )}

        {/* MODAL ZONAS */}
        {showZonesModal && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-6">

            <div className="bg-white rounded-3xl w-full max-w-[500px] overflow-hidden">

              <div className="bg-[#243847] text-white px-6 py-5 flex items-center justify-between">

                <h3 className="text-2xl font-bold">
                  Zonas del paquete
                </h3>

                <button
                  onClick={() =>
                    setShowZonesModal(
                      false
                    )
                  }
                  className="text-white text-xl"
                >

                  ✕

                </button>

              </div>

              <div className="p-6 space-y-4">

                {zonesDetail.map(
                  (
                    item: any,
                    index: number
                  ) => (

                    <div
                      key={index}
                      className="border rounded-2xl p-4 flex justify-between"
                    >

                      <span className="font-medium">

                        {
                          item
                            .laser_zones
                            ?.name
                        }

                      </span>

                      <span className="font-bold">

                        S/
                        {
                          item
                            .laser_zones
                            ?.price
                        }

                      </span>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        )}

        {/* MODAL SESIONES */}
        {showSessionsModal && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] p-6">

            <div className="bg-white rounded-3xl w-full max-w-[1100px] overflow-y-auto max-h-[90vh]">

              <div className="bg-[#243847] text-white px-6 py-5 flex items-center justify-between">

                <h3 className="text-2xl font-bold">

                  Sesiones programadas

                </h3>

                <button
                  onClick={() =>
                    setShowSessionsModal(
                      false
                    )
                  }
                  className="text-white text-xl"
                >

                  ✕

                </button>

              </div>

              <div className="p-6 overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                  <thead>

                    <tr className="border-b">

                      <th className="text-left p-3">
                        #
                      </th>

                      <th className="text-left p-3">
                        Fecha
                      </th>

                      <th className="text-left p-3">
                        Estado
                      </th>

                      <th className="text-left p-3">
                        Seguimiento
                      </th>

                      <th className="text-left p-3">
                        Acciones
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {sessionsDetail.map(
                      (session: any) => (

                        <tr
                          key={session.id}
                          className="border-b align-top"
                        >

                          <td className="p-3">

                            {
                              session.session_number
                            }

                          </td>

                          <td className="p-3">

                            {
                              session.scheduled_date
                              }

                              <br />

                              <span className="text-sm text-gray-500">

                              {
                                  session.scheduled_time
                              }

                              </span>

                          </td>

                        <td className="p-3">

    <button

      onClick={() =>

        updateSession(
          session
        )

      }

      className={`px-4 py-2 rounded-xl text-white text-sm

        ${session.completed
          ? "bg-green-600"
          : "bg-orange-500"}

      `}
    >

                      {session.completed
                      ? "✅ Atendida"
                      : "⏳ Pendiente"}

                  </button>

                  </td>
                          <td className="p-3 min-w-[350px]">

    <div className="space-y-3">

      <input
        type="text"
        placeholder="Parámetro / Intensidad"
        defaultValue={
          session.session_parameter || ""
        }
        onChange={(e) =>
          updateSessionField(
            session.id,
            "session_parameter",
            e.target.value
          )
        }
        className="w-full border border-gray-200 bg-[#f8fafc] p-3 rounded-xl"
      />

      <textarea
        placeholder="Avance"
        defaultValue={
          session.session_progress || ""
        }
        onChange={(e) =>
          updateSessionField(
            session.id,
            "session_progress",
            e.target.value
          )
        }
        className="w-full border border-gray-200 bg-[#f8fafc] p-3 rounded-xl"
      />

      <textarea
        placeholder="Observaciones"
        defaultValue={
          session.session_notes || ""
        }
        onChange={(e) =>
          updateSessionField(
            session.id,
            "session_notes",
            e.target.value
          )
        }
        className="w-full border border-gray-200 bg-[#f8fafc] p-3 rounded-xl"
      />

    </div>

  </td>

  <td className="p-3">

    {!session.completed &&
    !session.appointment_id && (

      <button

        onClick={() => {

          setSelectedSession(
            session
          );

          setScheduleDate(
            session.scheduled_date
          );

          setScheduleTime(
            session.scheduled_time || ""
          );

          setShowScheduleSessionModal(
            true
          );

        }}

        className="bg-blue-600 text-white px-4 py-2 rounded-xl"

      >

        Programar

      </button>

    )}

    {session.appointment_id && (

      <span className="text-green-600 font-semibold">

        📅 Reservada

      </span>

    )}

  </td>
                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

        {showScheduleSessionModal && (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[80]">

      <div className="bg-white p-8 rounded-3xl w-[500px] shadow-2xl">

        <h3 className="text-2xl font-bold text-[#243847] mb-6">

          Programar sesión

        </h3>

        <div className="space-y-4">

          <input
            type="date"
            value={scheduleDate}
            onChange={(e) =>
              setScheduleDate(
                e.target.value
              )
            }
            className="w-full border p-4 rounded-2xl"
          />

          <input
            type="time"
            value={scheduleTime}
            onChange={(e) =>
              setScheduleTime(
                e.target.value
              )
            }
            className="w-full border p-4 rounded-2xl"
          />

        </div>

        <div className="flex gap-4 mt-8">

          <button

            onClick={() =>
              setShowScheduleSessionModal(
                false
              )
            }

            className="bg-gray-200 px-5 py-3 rounded-2xl"

          >

            Cancelar

          </button>

          <button

            onClick={scheduleSession}

            className="bg-[#243847] text-white px-5 py-3 rounded-2xl"

          >

            Crear reserva

          </button>

        </div>

      </div>

    </div>

  )}

  {showAddSessionsModal && (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90]">

      <div className="bg-white p-8 rounded-3xl w-[450px] shadow-2xl">

        <h3 className="text-2xl font-bold text-[#243847] mb-6">

          Agregar sesiones

        </h3>

        <select
  value={additionalSessions}
  onChange={(e) =>
    setAdditionalSessions(
      Number(e.target.value)
    )
  }
  className="w-full border p-4 rounded-2xl"
>
  <option value={1}>1 sesión</option>
  <option value={3}>3 sesiones</option>
  <option value={6}>6 sesiones</option>
</select>
<div className="bg-gray-100 p-4 rounded-2xl mt-4">

  <p>
    Precio por sesión:
    <strong>
      S/ {
        Number(selectedPackage?.unit_price || 0)
      }
    </strong>
  </p>

  <p>
    Descuento:
    <strong>
      {
        additionalSessions === 3
          ? " 10%"
          : additionalSessions === 6
          ? " 15%"
          : " 0%"
      }
    </strong>
  </p>

</div>

        <div className="flex gap-4 mt-8">

          <button

            onClick={() =>
              setShowAddSessionsModal(false)
            }

            className="bg-gray-200 px-5 py-3 rounded-2xl"

          >

            Cancelar

          </button>

          <button

            onClick={addSessionsToPackage}

            className="bg-green-600 text-white px-5 py-3 rounded-2xl"

          >

            Agregar

          </button>

        </div>

      </div>

    </div>

  )}

      </div>
    );
  }