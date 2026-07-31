"use client";

import { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";

import timeGridPlugin from "@fullcalendar/timegrid";

import interactionPlugin from "@fullcalendar/interaction";

import esLocale from "@fullcalendar/core/locales/es";

import { supabase } from "@/lib/supabase";


type Props = {
  selectedBranch: number;
  setPage: (page: string) => void;
  setPendingLaserSale: (data: any) => void;
};

export default function AppointmentsPage({
  selectedBranch,
  setPage,
  setPendingLaserSale,
}: Props) {

  const [events, setEvents] =
    useState<any[]>([]);
  
    const [
  showReprogramModal,
  setShowReprogramModal
] = useState(false);

    const [
      reprogramDate,
      setReprogramDate
    ] = useState("");

    const [
      reprogramTime,
      setReprogramTime
    ] = useState("");

        const [
  showSalesModal,
  setShowSalesModal
] = useState(false);

const [
  completedAppointmentId,
  setCompletedAppointmentId
] = useState<number | null>(null);

const [
  laserSaleAppointmentId,
  setLaserSaleAppointmentId
] = useState<number | null>(null);

const [
  laserSaleWorkerId,
  setLaserSaleWorkerId
] = useState<number | null>(null);

const [
  additionalServiceId,
  setAdditionalServiceId
] = useState("");

const [
  soldPrice,
  setSoldPrice
] = useState("");

const [
  appointmentSales,
  setAppointmentSales
] = useState<any[]>([]);

const [
  pendingSalesCart,
  setPendingSalesCart
] = useState<any[]>([]);

const [
  pendingServiceId,
  setPendingServiceId
] = useState("");

const [
  pendingServicePrice,
  setPendingServicePrice
] = useState("");

const [
  pendingSoldTotal,
  setPendingSoldTotal
] = useState("");

const [
  pendingAdvance,
  setPendingAdvance
] = useState("");

const [
  pendingNotes,
  setPendingNotes
] = useState("");

const [
  salesCart,
  setSalesCart
] = useState<any[]>([]);

const [
  additionalSaleCommission,
  setAdditionalSaleCommission
] = useState(20);



  const [selectedDate,
    setSelectedDate] =
    useState("");

  const [showModal,
    setShowModal] =
    useState(false);

  const [editingAppointmentId,
    setEditingAppointmentId] =
    useState<number | null>(null);

  const [
  clientSearch,
  setClientSearch
] = useState("");

  const [clientId, setClientId] =
    useState("");

  const [serviceId,
    setServiceId] =
    useState("");

    const [
  selectedServices,
  setSelectedServices
] = useState<number[]>([]);

  const [workerId,
    setWorkerId] =
    useState("");

  const [branchId,
    setBranchId] =
    useState("");

  const [
  finalPrice,
  setFinalPrice
  ] = useState("");

  const [
  isCompleted,
  setIsCompleted
] = useState(false);

const [
  showAdvanceModal,
  setShowAdvanceModal
] = useState(false);

const [
  advanceAmount,
  setAdvanceAmount
] = useState("");

const [
  advanceNotes,
  setAdvanceNotes
] = useState("");

const [
  currentAdvance,
  setCurrentAdvance
] = useState(0);

const [
  remainingAdvance,
  setRemainingAdvance
] = useState(0);

const [
  isAdvanceCompleted,
  setIsAdvanceCompleted
] = useState(false);

const [
  appointmentTotal,
  setAppointmentTotal
] = useState(0);

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

  const [
  isPackageAppointment,
  setIsPackageAppointment
] = useState(false);

const [
  showPaymentModal,
  setShowPaymentModal
] = useState(false);

const [
  paymentTotal,
  setPaymentTotal
] = useState(0);

const [
  paymentAdvance,
  setPaymentAdvance
] = useState(0);

const [
  paymentRemaining,
  setPaymentRemaining
] = useState(0);

const [
  completingAppointmentId,
  setCompletingAppointmentId
] = useState<number | null>(null);

const [
  showPendingServiceModal,
  setShowPendingServiceModal
] = useState(false);

const [
  pendingServiceAppointment,
  setPendingServiceAppointment
] = useState<any>(null);

const loadAdditionalSaleCommission =
async () => {

  const { data } =
    await supabase

      .from("system_settings")

      .select("setting_value")

      .eq(
        "branch_id",
        selectedBranch
      )

      .eq(
        "category",
        "commission"
      )

      .eq(
        "setting_key",
        "additional_sale"
      )

      .maybeSingle();

  setAdditionalSaleCommission(
    Number(
      data?.setting_value ?? 20
    )
  );

};

  // OBTENER CITAS
  const fetchAppointments = async () => {

    const { data, error } =
      await supabase

        .from("appointments")

        .select(`
  *,
  clients(full_name),
  services(
    name,
    price
  ),
  workers(
    name,
    color
  ),
appointment_reserved_services(
  service_id,
  services(
    name,
    duration
  )
)
`)
            .eq("branch_id", selectedBranch)
        
                        .neq(
          "status",
          "Cancelada"
        )
        ;

    if (error) {

      console.log(error);

      return;
    }

    const formattedEvents =
      (data || []).map(
        (appointment) => ({

          id: appointment.id,
title:

  (
    appointment.package_id

      ? "🎁 "

      : ""

  )

  +

  (
    appointment.status ===
    "Atendida"

      ? "✅ "

      : ""

  )

  +

  "S/" +

 (
  appointment.final_price ??

  appointment.services
    ?.price ??

  0
)

  +

  " - " +

  appointment.clients
  ?.full_name +

" - " +

(
  appointment
    .appointment_reserved_services
    ?.length > 0

    ? appointment
        .appointment_reserved_services
        .map(
          (item: any) =>
            item.services?.name
        )
        .join(" + ")

    : appointment.services
        ?.name
)

+

(

  appointment.notes

    ? " - " +
      appointment.notes

    : ""

)

+

" - " +

appointment.workers?.name?.split(" ")[0],

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

              package_id: appointment.package_id,

                reserved_services:
    appointment
      .appointment_reserved_services,

            worker_id:
              appointment.worker_id,

            branch_id:
              appointment.branch_id,

            final_price:
              appointment.final_price,

            status:
              appointment.status,

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

        .eq("active", true)
        
        .eq("branch_id", selectedBranch);

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
  selectedServices.length === 0 ||
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

 const selectedServicesData =
  services.filter(
    (service) =>
      selectedServices.includes(
        service.id
      )
  );

const originalPrice =
  selectedServicesData.reduce(
    (sum, service) =>

      sum +
      Number(
        service.price || 0
      ),

    0
  );

const soldPrice =

  finalPrice

    ? Number(finalPrice)

    : originalPrice;

let durationMinutes = 0;

selectedServicesData.forEach(
  (service) => {

    if (
      !service.duration
    ) {

      durationMinutes += 60;

      return;
    }

    const durationText =
      service.duration
        .toLowerCase();

    if (
      durationText.includes(
        "hora"
      )
    ) {

      const hours =
        parseInt(
          durationText
        ) || 1;

      durationMinutes +=
        hours * 60;

      return;
    }

    if (
      durationText.includes(
        "minuto"
      )
    ) {

      durationMinutes +=
        parseInt(
          durationText
        ) || 60;

      return;
    }

    durationMinutes += 60;

  }
);

const end =
  new Date(start);

end.setMinutes(
  end.getMinutes() +
    durationMinutes
);

const appointmentDate =
  `${start.getFullYear()}-${
    String(
      start.getMonth() + 1
    ).padStart(2, "0")
  }-${
    String(
      start.getDate()
    ).padStart(2, "0")
  }`;
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

            .neq(
            "status",
            "Cancelada"
          )

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

          if (
  appointment.status ===
  "Cancelada"
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

    .neq(
      "status",
      "Cancelada"
    )

    .eq(
      "worker_id",
      parseInt(workerId)
    )

    .eq(
      "appointment_date",
      appointmentDate
    );

 const hasConflict =
  conflicts?.some(
    (appt: any) => {

      // IGNORAR MISMA CITA
      if (

        appt.id ===
        editingAppointmentId

      ) {

        return false;
      }

      return (

        startTime <
          appt.end_time

        &&

        endTime >
          appt.start_time
      );
    }
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
        selectedServices[0],

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

      original_price:
        originalPrice,

      final_price:
        soldPrice,

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

await supabase

  .from(
    "appointment_reserved_services"
  )

  .delete()

  .eq(
    "appointment_id",
    editingAppointmentId
  );

const reservedServices =

  selectedServices.map(
    (serviceId) => ({

      appointment_id:
        editingAppointmentId,

      service_id:
        serviceId,

    })
  );

const {
  error:
    reservedServicesError
} =
  await supabase

    .from(
      "appointment_reserved_services"
    )

    .insert(
      reservedServices
    );

if (
  reservedServicesError
) {

  console.log(
    reservedServicesError
  );

  alert(
    "Error actualizando servicios"
  );

  return;
}

alert(
  "Reserva actualizada"
);

    } else {
       
      
      // CREAR
      const {
  data: newAppointment,
  error
} =
  await supabase

    .from("appointments")

    .insert([
      {

        client_id:
          parseInt(
            clientId
          ),

        service_id:
          selectedServices[0],

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
          "Pendiente",

        notes: "",

        original_price:
          originalPrice,

        final_price:
          soldPrice,

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

const reservedServices =

  selectedServices.map(
    (serviceId) => ({

      appointment_id:
        newAppointment.id,

      service_id:
        serviceId,

    })
  );

const {
  error:
    reservedServicesError
} =
  await supabase

    .from(
      "appointment_reserved_services"
    )

    .insert(
      reservedServices
    );

if (
  reservedServicesError
) {

  console.log(
    reservedServicesError
  );

  alert(
    "Error guardando servicios"
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

    setSelectedServices([]);

    fetchAppointments();
  };

  const updatePackageWorker = async () => {

  if (!editingAppointmentId || !workerId) {

    alert("Seleccione una trabajadora.");

    return;

  }

  const { error } = await supabase

    .from("appointments")

    .update({

      worker_id: Number(workerId)

    })

    .eq("id", editingAppointmentId);

  if (error) {

    console.log(error);

    alert("Error actualizando trabajadora.");

    return;

  }

  alert("Trabajadora actualizada correctamente.");

  fetchAppointments();

  setShowModal(false);

};


  // CARGAR
useEffect(() => {

  loadAdditionalSaleCommission();

  fetchAppointments();

}, [selectedBranch]);

useEffect(() => {

  fetchFormData();

}, [selectedBranch]);



const cancelAppointment =


  async (
    appointmentId: number
  ) => {

    const confirmCancel =
      confirm(
        "¿Cancelar cita?"
      );

    if (!confirmCancel)
      return;

    // Si pertenece a un paquete, liberar la sesión
const { data: packageSession } =
  await supabase

    .from("package_sessions")

    .select("id")

    .eq(
      "appointment_id",
      appointmentId
    )

    .maybeSingle();

if (packageSession) {

  await supabase

    .from("package_sessions")

    .update({

      appointment_id: null,

      completed: false,

      completed_at: null,

      attended_date: null,

      session_parameter: null,

      session_progress: null,

      session_notes: null,

      before_photo_url: null,

      after_photo_url: null,

      notes: null

    })

    .eq(
      "id",
      packageSession.id
    );

}

await supabase

  .from("pending_sales")

  .update({

    status: "Pendiente",

    appointment_generated_id: null

  })

  .eq(
    "appointment_generated_id",
    Number(appointmentId)
  );

const { error } =
  await supabase

    .from("appointments")

    .update({

      status: "Cancelada"

    })

    .eq(
      "id",
      appointmentId
    );

    if (error) {

      console.log(error);

      alert(
        "Error cancelando cita"
      );

      return;
    }

    alert(
      "Cita cancelada"
    );

    fetchAppointments();
  };

  const completeAppointment =
  async (
    appointmentId: number
  ) => {

    const appointment =
  events.find(
    (event) =>
      event.id ===
      appointmentId
  );

const totalPrice =
  Number(
    appointment?.extendedProps
      ?.final_price || 0
  );

const {
  data: advances
} =
await supabase

  .from(
    "appointment_advances"
  )

  .select("amount")

  .eq(
    "appointment_id",
    appointmentId
  )

  .eq(
    "status",
    "Activo"
  );

const totalAdvance =

  (advances || []).reduce(

    (sum, item) =>

      sum +
      Number(item.amount),

    0

  );

const remaining =

  totalPrice -
  totalAdvance;

 if (
  totalAdvance > 0
) {

  setPaymentTotal(
    totalPrice
  );

  setPaymentAdvance(
    totalAdvance
  );

  setPaymentRemaining(
    remaining
  );

  setCompletingAppointmentId(
    appointmentId
  );

  setShowPaymentModal(
    true
  );

  return;

}

await processAppointmentCompletion(
    appointmentId
);

    
  };  

const saveAdvance =
async () => {

  if (
    !editingAppointmentId
  ) {

    alert(
      "No se encontró la reserva."
    );

    return;

  }

  if (
    !advanceAmount
  ) {

    alert(
      "Ingrese el monto del adelanto."
    );

    return;

  }

  const appointment =
    events.find(
      (event) =>
        event.id ===
        editingAppointmentId
    );

  if (!appointment) {

    alert(
      "Reserva no encontrada."
    );

    return;

  }

  const newAdvance =
  Number(advanceAmount);

if (newAdvance <= 0) {

  alert(
    "Ingrese un monto válido."
  );

  return;

}

if (newAdvance > remainingAdvance) {

  alert(
    `El adelanto no puede superar el saldo pendiente de S/${remainingAdvance}.`
  );

  return;

}

  const { error } =
    await supabase

      .from(
        "appointment_advances"
      )

      .insert({

        appointment_id:
          editingAppointmentId,

        client_id:
          appointment
            .extendedProps
            .client_id,

        amount:
          Number(
            advanceAmount
          ),

        notes:
          advanceNotes,

        status:
          "Activo"

      });

if (error) {

  console.log(error);

  alert(error.message);

  return;

}

  await supabase

    .from(
      "appointments"
    )

    .update({

      has_advance:
        true

    })

    .eq(
      "id",
      editingAppointmentId
    );

  alert(
    "Adelanto registrado."
  );

  setAdvanceAmount("");

  setAdvanceNotes("");

  setCurrentAdvance(
  currentAdvance + Number(advanceAmount)
);

setRemainingAdvance(
  remainingAdvance - Number(advanceAmount)
);

if (
  remainingAdvance - Number(advanceAmount) <= 0
) {

  setIsAdvanceCompleted(true);

}

  setShowAdvanceModal(false);

  fetchAppointments();

};

const processAppointmentCompletion =
async (
  appointmentId: number
) => {

  const { data: pendingSale } =

  await supabase

    .from("pending_sales")

    .select("*")

    .eq(
      "appointment_generated_id",
      appointmentId
    )

    .maybeSingle();

const { error } =
      await supabase

        .from(
          "appointments"
        )

        .update({

          status:
            "Atendida",

        })

        .eq(
          "id",
          appointmentId
        );

    if (error) {

      console.log(error);

      alert(
        "Error marcando atención"
      );

      return;
    }

   if (pendingSale) {

  if (pendingSale.sale_type === "Venta adicional") {

    const { data: items } =

      await supabase

        .from("pending_sale_items")

        .select("*")

        .eq(
          "pending_sale_id",
          pendingSale.id
        );

    if (items && items.length > 0) {

      const sales = items.map((item: any) => ({

        appointment_id: appointmentId,

        service_id: item.service_id,

        worker_id:
          pendingSale.sold_by_worker_id,

        original_price:
          item.original_price,

        sold_price:
          item.sold_price,
commission_percentage:
  additionalSaleCommission,

commission_amount:
  Number(item.sold_price) *
  (additionalSaleCommission / 100)

      }));

      await supabase

        .from("appointment_services")

        .insert(sales);

    }

  }

  await supabase

    .from("pending_sales")

    .update({

      status: "Consumido"

    })

    .eq(
      "id",
      pendingSale.id
    );

}
    const {
  data: packageSession
} =
  await supabase

    .from(
      "package_sessions"
    )

    .select("*")

    .eq(
      "appointment_id",
      appointmentId
    )

    .single();

if (
  packageSession
) {

  await supabase

    .from(
      "package_sessions"
    )

    .update({

      completed: true,

      attended_date:
        new Date()
          .toISOString()
          .split("T")[0],

      completed_at:
        new Date()
          .toISOString()

    })

    .eq(
      "id",
      packageSession.id
    );

}

const {
  data: packageData
} =
await supabase

  .from(
    "client_packages"
  )

  .select(`
    *,
    services(
      id,
      name
    )
  `)

  .eq(
    "id",
    packageSession?.package_id
  )

  .single();

if (

  packageSession &&

  packageData?.internal_sale

) {

  const {
  data: payment,
  error: paymentError
} =
await supabase

  .from(
    "package_payments"
  )

  .select("*")

  .eq(
    "package_session_id",
    packageSession.id
  )

  .single();

if (paymentError) {

  console.log(paymentError);

}

const {
  data: existingSale
} =
await supabase

  .from(
    "appointment_services"
  )

  .select("id")

  .eq(
    "package_session_id",
    packageSession.id
  )

  .maybeSingle();

if (

  !existingSale &&

  payment &&

  Number(payment.amount) > 0

) {

    await supabase

      .from(
        "appointment_services"
      )

      .insert({

        appointment_id:
          packageData.internal_sale_appointment_id,

        package_session_id:
          packageSession.id,

        service_id:
          packageData.service_id,

        worker_id:
          packageData.internal_sale_worker_id,

        original_price:
          payment.amount,

        sold_price:
          payment.amount,

    commission_percentage:
  additionalSaleCommission,

commission_amount:
  payment.amount *
  (additionalSaleCommission / 100)

      });

  }

}
setCompletedAppointmentId(
  appointmentId
);

const currentAppointment =
  events.find(
    (event) =>
      event.id ===
      appointmentId
  );

setLaserSaleAppointmentId(
  appointmentId
);

setLaserSaleWorkerId(
  currentAppointment
    ?.extendedProps
    ?.worker_id || null
);

setShowSalesModal(true);

fetchAppointments();

setShowModal(false);

};

const finishAdvancePayment =
async () => {

  if (
    !completingAppointmentId
  ) return;

  const { error } =
    await supabase

      .from(
        "appointment_advances"
      )

      .update({

        status:
          "Consumido",

        consumed_at:
          new Date()
            .toISOString()

      })

      .eq(
        "appointment_id",
        completingAppointmentId
      )

      .eq(
        "status",
        "Activo"
      );

  if (error) {

    alert(error.message);

    return;

  }

  await supabase

    .from(
      "appointments"
    )

    .update({

      has_advance:
        false

    })

    .eq(
      "id",
      completingAppointmentId
    );

  setShowPaymentModal(false);

  await processAppointmentCompletion(
    completingAppointmentId
);

};

const addSaleToCart = () => {

  if (
    !additionalServiceId ||
    !soldPrice
  ) {

    alert(
      "Completa los campos"
    );

    return;
  }

  const selectedService =
    services.find(
      (service) =>

        service.id ===
        parseInt(
          additionalServiceId
        )
    );

  if (!selectedService)
    return;

  const newSale = {

    service_id:
      selectedService.id,

    service_name:
      selectedService.name,

    original_price:
      selectedService.price,

    sold_price:
      parseFloat(
        soldPrice
      ),

  };

  setSalesCart(
    [
      ...salesCart,
      newSale
    ]
  );

  setAdditionalServiceId("");

  setSoldPrice("");

};

const addPendingSaleToCart = () => {

  if (
    !pendingServiceId ||
    !pendingServicePrice
  ) {

    alert("Complete los datos.");

    return;

  }

  const service =
    services.find(
      (s) =>
        s.id === Number(pendingServiceId)
    );

  if (!service) return;

const updatedCart = [

  ...pendingSalesCart,

  {

    service_id: service.id,

    service_name: service.name,

    original_price: Number(service.price),

    sold_price: Number(pendingServicePrice)

  }

];

setPendingSalesCart(updatedCart);

const totalVendido = updatedCart.reduce(

  (total, item) => total + Number(item.sold_price),

  0

);

setPendingSoldTotal(totalVendido.toString());

setPendingServiceId("");

setPendingServicePrice("");

};
  const saveAdditionalService =

async () => {

  if (
    salesCart.length === 0 ||
    !completedAppointmentId
  ) {

    alert(
      "Agrega al menos un servicio"
    );

    return;
  }

  const currentAppointment =
    events.find(
      (event) =>

        event.id ===
        completedAppointmentId
    );

  const workerId =
    currentAppointment
      ?.extendedProps
      ?.worker_id;

  const salesToInsert =

    salesCart.map(
      (sale) => ({

        appointment_id:
          completedAppointmentId,

        service_id:
          sale.service_id,

        worker_id:
          workerId,

        original_price:
          sale.original_price,

        sold_price:
          sale.sold_price,

        commission_percentage:
  additionalSaleCommission,

commission_amount:
  sale.sold_price *
  (additionalSaleCommission / 100),

      })
    );

  const { error } =
    await supabase

      .from(
        "appointment_services"
      )

      .insert(
        salesToInsert
      );

  if (error) {

    console.log(error);

    alert(
      "Error guardando ventas"
    );

    return;
  }

  alert(
    "Ventas guardadas"
  );

  setSalesCart([]);

  setAdditionalServiceId("");

  setSoldPrice("");

  setShowSalesModal(false);

};

const savePendingSale = async () => {

  if (pendingSalesCart.length === 0) {

    alert("Agrega al menos un servicio.");

    return;

  }

  if (!pendingSoldTotal) {

    alert("Ingrese el precio vendido.");

    return;

  }

  const { data, error } = await supabase

   .from("pending_sales")

.insert({

  client_id:
    pendingServiceAppointment.extendedProps.client_id,

  appointment_id:
    pendingServiceAppointment.id,

  sold_by_worker_id:
    pendingServiceAppointment.extendedProps.worker_id,

  original_total:

    pendingSalesCart.reduce(

      (t, s) =>

        t + Number(s.original_price),

      0

    ),

  sold_total:
    Number(pendingSoldTotal),

  advance:
    Number(pendingAdvance || 0),

  sale_type:
    "Venta adicional",

  origin:
    "Atención",

  notes:
    pendingNotes

})
    .select()

    .single();

  if (error) {

    alert(error.message);

    return;

  }

  const totalOriginal = pendingSalesCart.reduce(

  (t, s) =>

    t + Number(s.original_price),

  0

);

const items = pendingSalesCart.map((item) => ({

  pending_sale_id: data.id,

  service_id: item.service_id,

  service_name: item.service_name,

  original_price: item.original_price,

  sold_price:

    Number(

      (

        Number(item.original_price) /

        totalOriginal

      ) *

      Number(pendingSoldTotal)

    ).toFixed(2)

}));

const { error: itemsError } =

  await supabase

    .from("pending_sale_items")

    .insert(items);

if (itemsError) {

  alert(itemsError.message);

  return;

}

  alert("Venta futura guardada correctamente.");

setShowPendingServiceModal(false);

setPendingSalesCart([]);

setPendingSoldTotal("");

setPendingAdvance("");

setPendingNotes("");

setPendingServiceId("");

setPendingServicePrice("");

};
  const revertAppointment =

async (
  appointmentId: number
) => {

  const {

  data: pendingSales

} = await supabase

  .from("pending_sales")

  .select("id")

  .eq(
    "appointment_id",
    appointmentId
  )

  .eq(
    "status",
    "Pendiente"
  );

  if (

  pendingSales &&
  pendingSales.length > 0

) {

  const cancelar = window.confirm(

`Esta atención tiene ${pendingSales.length} venta(s) futura(s).

Aceptar = Cancelarlas

Cancelar = Conservarlas`

  );

  if (cancelar) {

    await supabase

      .from("pending_sales")

      .update({

        status:
          "Cancelado"

      })

      .eq(
        "appointment_id",
        appointmentId
      )

      .eq(
        "status",
        "Pendiente"
      );

  }

}

  await supabase

    .from(
      "appointment_services"
    )

    .delete()

    .eq(
      "appointment_id",
      appointmentId
    );

  await supabase

    .from(
      "appointments"
    )

    .update({

      status:
        "Pendiente"

    })

    .eq(
      "id",
      appointmentId
    );

  alert(
    "Atención revertida"
  );

  fetchAppointments();

  setShowModal(false);

};
  const reprogramAppointment =
  async (
    appointmentId: number,
    newDate: string,
    newTime: string
  ) => {
      const currentEvent =
  events.find(
    (event) =>
      event.id ===
      appointmentId
  );

const reservedServices =

  currentEvent
    ?.extendedProps
    ?.reserved_services || [];

let durationMinutes = 0;

reservedServices.forEach(
  (item: any) => {

    const durationText =
      item.services?.duration
        ?.toLowerCase() || "";

    if (
      durationText.includes(
        "hora"
      )
    ) {

      durationMinutes +=
        (
          parseInt(
            durationText
          ) || 1
        ) * 60;

      return;
    }

    if (
      durationText.includes(
        "minuto"
      )
    ) {

      durationMinutes +=
        parseInt(
          durationText
        ) || 60;

      return;
    }

    durationMinutes += 60;

  }
);

if (
  durationMinutes === 0
) {

  durationMinutes = 60;

} 


const start =
  new Date(
    `${newDate}T${newTime}`
  );

const end =
  new Date(start);

end.setMinutes(
  end.getMinutes() +
    durationMinutes
);

const endTime =
  end
    .toTimeString()
    .slice(0, 5);   


    const { error } =
      await supabase

        .from(
          "appointments"
        )

        .update({

          appointment_date:
            newDate,

            start_time:
            newTime,

            end_time:
            endTime,

        })

        .eq(
          "id",
          appointmentId
        );

    if (error) {

      console.log(error);

      alert(
        "Error reprogramando"
      );

      return;
    }
const { data: appointment } =
  await supabase

    .from("appointments")

    .select("package_id")

    .eq("id", appointmentId)

    .single();

if (appointment?.package_id) {

  await supabase

  .from("package_sessions")

  .update({

    scheduled_date: newDate,

    scheduled_time: newTime

  })

  .eq(
    "appointment_id",
    appointmentId
  );

  const { data: currentSession } =
    await supabase

      .from("package_sessions")

      .select("*")

      .eq(
        "appointment_id",
        appointmentId
      )

      .single();

  if (currentSession) {

    const { data: packageData } =
      await supabase

        .from("client_packages")

        .select("session_frequency")

        .eq(
          "id",
          appointment.package_id
        )

        .single();

    const frequency =
      packageData?.session_frequency || 30;

    const { data: nextSessions } =
      await supabase

        .from("package_sessions")

        .select("*")

        .eq(
          "package_id",
          appointment.package_id
        )

        .gt(
          "session_number",
          currentSession.session_number
        )

        .order(
          "session_number"
        );

    let baseDate =
      new Date(newDate);

    for (const session of nextSessions || []) {

      if (session.completed) {
        continue;
      }

      baseDate.setDate(
        baseDate.getDate() +
        frequency
      );

      const nextDate =
        baseDate
          .toISOString()
          .split("T")[0];

      await supabase

        .from("package_sessions")

        .update({

          scheduled_date:
            nextDate,

          scheduled_time:
            newTime

        })

        .eq(
          "id",
          session.id
        );

      if (session.appointment_id) {

        await supabase

          .from("appointments")

          .update({

            appointment_date:
              nextDate,

            start_time:
              newTime

          })

          .eq(
            "id",
            session.appointment_id
          );

      }

    }

  }

}
// Pendiente:
// mover sesiones de paquetes
    alert(
      "Reserva reprogramada"
    );

    fetchAppointments();

    setShowModal(false);
  };

  return (

    <div>

      {/* HEADER */}
      <div className="mb-8">

        <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-[#243847]">

          Reservas 📅

        </h2>

        <p className="text-gray-600 mt-2 text-sm md:text-lg">

          Gestión visual de citas

        </p>

      </div>

      {/* LEYENDA */}
     <div className="flex flex-wrap gap-2 md:gap-4 mb-6">

        {workers.map((worker) => (

          <div
            key={worker.id}
           className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl shadow text-sm"
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
      <div className="calendar-mobile bg-white p-2 md:p-6 rounded-3xl shadow-xl overflow-x-auto">

      

        <FullCalendar
 
          locale={esLocale}

          dayHeaderFormat={{
  weekday: "short",
  day: "numeric"
}}

titleFormat={{
  month: "short",
  day: "numeric"
}}

          plugins={[
            dayGridPlugin,

            timeGridPlugin,
            interactionPlugin,
          ]}

         initialView="timeGridWeek"

headerToolbar={{
  left: "prev today next",
  center: "title",
  right: "dayGridMonth,timeGridWeek,timeGridDay",
}}
           height={"auto"}

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

            setClientId("");

setServiceId("");

setSelectedServices([]);

setWorkerId("");

setBranchId("");

setFinalPrice("");



            setSelectedDate(
              info.startStr
            );

            setShowModal(true);

          }}

          // EDITAR
          eventClick={async (info) => {

            const appointment =
              info.event
                .extendedProps;

                setIsPackageAppointment(
  !!appointment.package_id
);

            setIsCompleted(

                appointment.status ===
                "Atendida"

              );

            setEditingAppointmentId(
              appointment.id
            );

            setClientId(
              appointment.client_id?.toString()
            );

            setServiceId(
              appointment.service_id?.toString()
            );

            const { data: reservedServices } =
  await supabase

    .from(
      "appointment_reserved_services"
    )

    .select(
      "service_id"
    )

    .eq(
      "appointment_id",
      appointment.id
    );

setSelectedServices(

  reservedServices?.map(
    (item) =>
      item.service_id
  ) || []

);

            setWorkerId(
              appointment.worker_id?.toString()
            );

            setBranchId(
              appointment.branch_id?.toString()
            );

            setFinalPrice(

              appointment.final_price
                ?.toString() || ""

            );

            const startDate =
  info.event.start;

if (startDate) {

  setSelectedDate(

    `${startDate.getFullYear()}-${
      String(
        startDate.getMonth() + 1
      ).padStart(2, "0")
    }-${
      String(
        startDate.getDate()
      ).padStart(2, "0")
    }T${
      startDate
        .toTimeString()
        .slice(0, 5)
    }`

  );

}

            supabase

  .from(
    "appointment_services"
  )

  .select(`
    *,
    services(name)
  `)

  .eq(
    "appointment_id",
    appointment.id
  )

  .then(({ data }) => {

    setAppointmentSales(
      data || []
    );

  });

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

  new Date(
    start.getTime() -
    start.getTimezoneOffset() * 60000
  )

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

            .neq(
        "status",
        "Cancelada"
      )

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

        if (

  appt.id ===
  editingAppointmentId

) {

  return false;
}

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

  `${start.getFullYear()}-${
    String(
      start.getMonth() + 1
    ).padStart(2, "0")
  }-${
    String(
      start.getDate()
    ).padStart(2, "0")
  }`,

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

        

          buttonText={{

            today: "Hoy",

            month: "Mes",

            week: "Semana",

            day: "Día",

          }}

         eventContent={(info) => (

  <div
    className="text-xs"
    style={{
      overflow: "hidden",
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      lineHeight: "14px"
    }}
  >

    {info.event.title}

  </div>

)}

eventDidMount={(info) => {

  info.el.title =
    info.event.title;

}}
      

          events={events}

        />

      </div>

      {/* MODAL */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-[700px] mx-4 p-5 md:p-8 rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">

            <h3 className="text-2xl font-bold text-[#243847] mb-6">

              {editingAppointmentId
                ? "Editar Reserva"
                : "Nueva Reserva"}

            </h3>

            <div className="space-y-4">

              {!isPackageAppointment && (

                <>


              {/* CLIENTE */}
                  <div className="space-y-2">

  <input
    type="text"
    placeholder="🔍 Buscar cliente..."
    value={clientSearch}
    onChange={(e) =>
      setClientSearch(
        e.target.value
      )
    }
    className="w-full border p-4 rounded-2xl"
  />

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

    {clients

      .filter(
        (client) =>

          client.full_name
            ?.toLowerCase()
            .includes(
              clientSearch
                .toLowerCase()
            )

          ||

          client.phone
            ?.includes(
              clientSearch
            )
      )

      .sort(
        (a, b) =>
          a.full_name.localeCompare(
            b.full_name
          )
      )

      .map((client) => (

        <option
          key={client.id}
          value={client.id}
        >

          {client.full_name}
          {" - "}
          {client.phone || ""}

        </option>

      ))}

  </select>

</div>

              {/* SERVICIO */}
           <div className="border rounded-2xl p-4">

  <p className="font-medium mb-3">

    Servicios

  </p>

  <div className="space-y-2 max-h-52 overflow-y-auto">

    {services.map((service) => (

      <label
        key={service.id}
        className="flex items-center gap-3"
      >

        <input
          type="checkbox"

          checked={
            selectedServices.includes(
              service.id
            )
          }

      onChange={(e) => {

  let updatedServices =
    [];

  if (
    e.target.checked
  ) {

    updatedServices = [

      ...selectedServices,

      service.id

    ];

  } else {

    updatedServices =

      selectedServices.filter(
        (id) =>
          id !== service.id
      );

  }

  setSelectedServices(
    updatedServices
  );

  const totalPrice =

    services

      .filter(
        (s) =>

          updatedServices.includes(
            s.id
          )
      )

      .reduce(
        (sum, s) =>

          sum +
          Number(
            s.price || 0
          ),

        0
      );

  setFinalPrice(
    totalPrice.toString()
  );

}}
        />

        <span>

          {service.name}

          {" - S/"}

          {service.price}

        </span>

      </label>

    ))}

  </div>

  

</div>

 </>
  )}

  {isPackageAppointment && (

  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">

    <p className="text-sm text-gray-500">
      Servicio del paquete
    </p>

    <p className="font-semibold text-lg">

      {
        services.find(
          (s) =>
            s.id === Number(serviceId)
        )?.name
      }

    </p>

  </div>

)}



              {/* TRABAJADORA */}
              <select
                value={workerId}
                onChange={(e) => {

  setWorkerId(
    e.target.value
  );

  const worker =
    workers.find(
      (w) =>
        w.id ===
        Number(
          e.target.value
        )
    );

  if (
    worker?.branch_id
  ) {

    setBranchId(
      worker.branch_id
        .toString()
    );
  }

}}
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
{!isPackageAppointment && (
                    <input

        type="number"

        placeholder="Precio final"

        value={finalPrice}

        onChange={(e) =>
          setFinalPrice(
            e.target.value
          )
        }

        className="w-full border p-4 rounded-2xl"

      />

      )}

          {isCompleted && (

  <div className="bg-gray-50 p-4 rounded-2xl">

    <h4 className="font-bold text-[#243847] mb-3">

      Ventas adicionales

    </h4>

    {appointmentSales.length === 0 ? (

      <p className="text-gray-500">

        Sin ventas adicionales

      </p>

    ) : (

      <div className="space-y-2">

        {appointmentSales.map(
          (sale) => (

            <div

              key={sale.id}

              className="flex justify-between bg-white p-3 rounded-xl"

            >

              <span>

                {sale.services?.name}

              </span>

              <span className="font-semibold">

                S/{sale.sold_price}

              </span>

            </div>

          )
        )}

      </div>

    )}

  </div>

)}
{!isPackageAppointment && (
  <>

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
  </>

)}

            </div>

            <div className="flex flex-wrap gap-4 mt-8">

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="bg-gray-200 px-5 py-3 rounded-2xl"
              >

                Cancelar

              </button>

{editingAppointmentId &&
 !isCompleted && (

  <button

    onClick={() => {

      setReprogramDate("");

      setReprogramTime("");

      setShowReprogramModal(true);

    }}

    className="bg-orange-500 text-white px-5 py-3 rounded-2xl"

  >

    Reprogramar

  </button>

  

)}             

{editingAppointmentId &&
 !isCompleted && (

  <>

    <button

  onClick={async () => {

  if (!editingAppointmentId)
    return;

  const appointment =
    events.find(
      (event) =>
        event.id ===
        editingAppointmentId
    );

  if (!appointment)
    return;

  const total =
    Number(
      appointment
        .extendedProps
        .final_price || 0
    );

  setAppointmentTotal(total);

  const {
    data
  } =
    await supabase

      .from(
        "appointment_advances"
      )

      .select("amount")

      .eq(
        "appointment_id",
        editingAppointmentId
      )

      .eq(
        "status",
        "Activo"
      );

  const advanced =

    (data || []).reduce(
      (sum, item) =>

        sum +
        Number(item.amount),

      0
    );

  setCurrentAdvance(
    advanced
  );

  setRemainingAdvance(
    total - advanced
  );

  setIsAdvanceCompleted(
  total - advanced <= 0
);

  setAdvanceAmount("");

  setAdvanceNotes("");

  setShowAdvanceModal(true);

}}

      className="bg-blue-600 text-white px-5 py-3 rounded-2xl"

    >

      💰 Adelanto

    </button>

    <button

      onClick={() =>

        completeAppointment(
          editingAppointmentId
        )

      }

      className="bg-green-600 text-white px-5 py-3 rounded-2xl"

    >

      Marcar atendida

    </button>

  </>

)}



{isCompleted && (

  <button

    onClick={() =>
      revertAppointment(
        editingAppointmentId!
      )
    }

    className="bg-yellow-500 text-white px-5 py-3 rounded-2xl"

  >

    Revertir atención

  </button>

)}
{editingAppointmentId &&
 !isCompleted && (
  
  

  <button

    onClick={() =>

      cancelAppointment(
        editingAppointmentId
      )

    }

    className="bg-red-500 text-white px-5 py-3 rounded-2xl whitespace-nowrap"

  >

    Eliminar reserva

  </button>

)}
       {!isCompleted && (

  <button

    onClick={

      isPackageAppointment

        ? updatePackageWorker

        : saveAppointment

    }

    className="bg-[#243847] text-white px-5 py-3 rounded-2xl"

  >

    {editingAppointmentId

      ? "Guardar cambios"

      : "Guardar Reserva"}

  </button>

)}
            </div>

          </div>

        </div>

      )}

      {showReprogramModal && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl w-full max-w-md mx-4 p-5 md:p-8 shadow-2xl">

    <h3 className="text-xl md:text-2xl font-bold text-[#243847] mb-6">

        Reprogramar reserva

      </h3>

      <div className="space-y-5">

        <input

          type="date"

          value={reprogramDate}

          onChange={(e) =>
            setReprogramDate(
              e.target.value
            )
          }

          className="w-full border p-4 rounded-2xl"

        />

        <input

          type="time"

          value={reprogramTime}

          onChange={(e) =>
            setReprogramTime(
              e.target.value
            )
          }

          className="w-full border p-4 rounded-2xl"

        />

      </div>

      <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-8">

        <button

          onClick={() =>
            setShowReprogramModal(false)
          }

          className="bg-gray-200 px-5 py-3 rounded-2xl"

        >

          Cancelar

        </button>

        <button

          onClick={() =>

            reprogramAppointment(
              editingAppointmentId!,
              reprogramDate,
              reprogramTime
            )

          }

          className="bg-orange-500 text-white px-5 py-3 rounded-2xl"

        >

          Guardar

        </button>

      </div>

    </div>

  </div>

)}

{showSalesModal && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl w-full max-w-2xl mx-4 p-5 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">

      <div className="flex justify-between items-center mb-10">

  <h2 className="text-4xl font-bold">
    Ventas adicionales
  </h2>

  <button
    onClick={() => {

      setShowSalesModal(false);

      setSalesCart([]);

      setAdditionalServiceId("");

      setSoldPrice("");

    }}
    className="text-3xl text-gray-500 hover:text-red-600"
  >
    ✕
  </button>

</div>

      <div className="space-y-4">

        <select

         value={additionalServiceId}

          onChange={(e) => {

  setAdditionalServiceId(
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

  setSoldPrice(

    service?.price
      ?.toString() || ""

  );

}}

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

        <input

          type="number"

          placeholder="Precio vendido"

          

          value={soldPrice}

          onChange={(e) =>
            setSoldPrice(
              e.target.value
            )
          }

          className="w-full border p-4 rounded-2xl"

        />

       <button

  onClick={addSaleToCart}

  className="w-full bg-green-600 text-white p-4 rounded-2xl"

>

  Agregar servicio

</button>


{salesCart.length > 0 && (

  <div className="space-y-2 mt-4">

    {salesCart.map(
      (sale, index) => (

        <div

          key={index}

          className="flex justify-between items-center bg-gray-100 p-3 rounded-2xl"

        >

          <div>

            <p className="font-medium">

              {sale.service_name}

            </p>

            <p className="text-sm text-gray-500">

              S/{sale.sold_price}

            </p>

          </div>

          <button

            onClick={() => {

              const updated =
                salesCart.filter(
                  (_, i) =>
                    i !== index
                );

              setSalesCart(
                updated
              );

            }}

            className="bg-red-500 text-white px-3 py-1 rounded-xl"

          >

            X

          </button>

        </div>

      )
    )}

  </div>

)}

      </div>
<div className="flex flex-col md:flex-row flex-wrap gap-3 mt-8">

  <button

  onClick={() => {

    const appointment =
      events.find(
        (e) =>
          e.id ===
          completedAppointmentId
      );

    if (!appointment) return;

    setPendingLaserSale({

      appointmentId:
        completedAppointmentId,

      clientId:
        appointment.extendedProps.client_id,

      workerId:
        appointment.extendedProps.worker_id,

      internalSale: true

    });

    setShowSalesModal(false);

    setPage("paquetes");

  }}

  className="bg-purple-600 text-white px-5 py-3 rounded-2xl"

>

  Vender paquete

</button>

<button

onClick={() => {

  const appointment =
    events.find(
      (e) =>
        e.id ===
        completedAppointmentId
    );

  if (!appointment) return;

  setPendingServiceAppointment(
    appointment
  );

  setPendingServiceId("");
setPendingServicePrice("");
setPendingSalesCart([]);

  setShowPendingServiceModal(
    true
  );

}}

  className="bg-orange-600 text-white px-5 py-3 rounded-2xl"

>

  Agendar otro día

</button>

<button
  onClick={saveAdditionalService}
  className="w-full mt-4 bg-[#243847] text-white py-3 rounded-2xl font-semibold"
>
  Guardar ventas
</button>

</div>

    </div>

  </div>

)}

{showAdvanceModal && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl w-full max-w-lg mx-4 p-5 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">

      <h2 className="text-3xl font-bold text-[#243847] mb-6">

        Registrar adelanto

      </h2>

      <div className="space-y-4">

        <div className="bg-gray-50 rounded-2xl p-4 mb-5">

  <div className="flex justify-between mb-2">
    <span>Precio del servicio</span>
    <strong>S/{appointmentTotal}</strong>
  </div>

  <div className="flex justify-between mb-2">
    <span>Adelantado</span>
    <strong className="text-green-600">
      S/{currentAdvance}
    </strong>
  </div>

  <div className="flex justify-between">
    <span>Saldo pendiente</span>
    <strong className="text-red-600">
      S/{remainingAdvance}
    </strong>
  </div>

</div>

{!isAdvanceCompleted ? (

  <>
        <input

          type="number"

          placeholder="Monto del adelanto"

          value={advanceAmount}

          onChange={(e) =>
            setAdvanceAmount(
              e.target.value
            )
          }

          className="w-full border p-4 rounded-2xl"

        />

        <textarea

          placeholder="Observación (opcional)"

          value={advanceNotes}

          onChange={(e) =>
            setAdvanceNotes(
              e.target.value
            )
          }

          className="w-full border p-4 rounded-2xl"

        />

       </>

) : (

  <div className="bg-green-50 border border-green-300 rounded-2xl p-5 text-center">

    <p className="text-green-700 font-semibold text-lg">

      ✅ Esta reserva ya fue pagada al 100%.

    </p>

  </div>

)}

</div>  

      <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-8">

        <button

          onClick={() =>
            setShowAdvanceModal(false)
          }

          className="bg-gray-200 px-5 py-3 rounded-2xl"

        >

          Cancelar

        </button>

           {!isAdvanceCompleted && (

  <button

    onClick={saveAdvance}

    className="bg-blue-600 text-white px-5 py-3 rounded-2xl"

  >

    Guardar

  </button>

)}

      </div>

    </div>

  </div>

)}

{showPaymentModal && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl w-full max-w-xl mx-4 p-5 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">

      <h2 className="text-3xl font-bold text-[#243847] mb-6">

        Finalizar atención

      </h2>

      <div className="bg-gray-50 rounded-2xl p-5 space-y-3">

        <div className="flex items-center justify-between gap-3">

          <span>Total del servicio</span>

          <strong>

            S/{paymentTotal}

          </strong>

        </div>

        <div className="flex justify-between">

          <span>Adelantado</span>

          <strong className="text-green-600">

            S/{paymentAdvance}

          </strong>

        </div>

        <div className="flex items-center justify-between gap-3">

          <span>Saldo pendiente</span>

          <strong className="text-red-600">

            S/{paymentRemaining}

          </strong>

        </div>

      </div>

      <div className="flex justify-end gap-3 mt-8">

        <button

          onClick={() =>
            setShowPaymentModal(false)
          }

          className="bg-gray-200 px-5 py-3 rounded-2xl"

        >

          Cancelar

        </button>

   <button

   onClick={finishAdvancePayment}

   className="bg-green-600 text-white px-5 py-3 rounded-2xl"

>

          Finalizar atención

        </button>

      </div>

    </div>

  </div>

)}

{showPendingServiceModal && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl w-full max-w-3xl mx-4 p-5 md:p-8 max-h-[90vh] overflow-y-auto">

      <h2 className="text-3xl font-bold mb-6">

        Agendar servicio para otro día

      </h2>

      <div className="space-y-4 mt-6">

  <select

value={pendingServiceId}

onChange={(e) => {

  setPendingServiceId(
    e.target.value
  );

  const service =
    services.find(
      (s) =>
        s.id === Number(e.target.value)
    );

  setPendingServicePrice(
    service?.price?.toString() || ""
  );

}}

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

  <input

    type="number"

    placeholder="Precio vendido"

   value={pendingServicePrice}

    onChange={(e) =>
      setPendingServicePrice(e.target.value)
    }

    className="w-full border p-4 rounded-2xl"

  />

  <button

  onClick={addPendingSaleToCart}

    className="w-full bg-green-600 text-white p-4 rounded-2xl"

  >

    Agregar servicio

  </button>

</div>

      <p className="text-gray-500">

        {pendingSalesCart.length > 0 && (

  <div className="space-y-2 mt-4">

    {pendingSalesCart.map((sale, index) => (

      <div
        key={index}
        className="flex justify-between items-center bg-gray-100 p-3 rounded-2xl"
      >

        <div>

          <p className="font-medium">
            {sale.service_name}
          </p>

          <p className="text-sm text-gray-500">
            S/{sale.sold_price}
          </p>

        </div>

        <button

        onClick={() => {

  const updatedCart = pendingSalesCart.filter(
    (_, i) => i !== index
  );

  setPendingSalesCart(updatedCart);

const totalVendido = updatedCart.reduce(

  (total, item) =>

    total + Number(item.sold_price),

  0

);

setPendingSoldTotal(totalVendido.toString());

}}

          className="bg-red-500 text-white px-3 py-1 rounded-xl"

        >

          X

        </button>

      </div>

    ))}

  </div>

)}

{pendingSalesCart.length > 0 && (

<div className="bg-gray-50 rounded-2xl p-5 mt-5 space-y-3">

<div className="space-y-2">

  <label className="text-sm font-medium text-gray-700">

    Total catálogo

  </label>

  <input

    type="text"

    value={`S/${pendingSalesCart.reduce(

      (sum, item) =>

        sum + Number(item.original_price),

      0

    )}`}

    readOnly

    className="w-full rounded-xl border bg-gray-100 px-4 py-3 text-lg font-semibold text-gray-700 cursor-not-allowed"

  />

</div>

<div>

<label className="block mb-2 font-semibold text-lg">

Precio vendido

</label>

<input

type="number"

value={pendingSoldTotal}

onChange={(e)=>

setPendingSoldTotal(e.target.value)

}

className="w-full border-2 border-green-500 rounded-xl p-4 text-2xl font-bold"

/>

</div>

<div>

<label className="block mb-2">

Adelanto

</label>

<input

type="number"

value={pendingAdvance}

onChange={(e)=>

setPendingAdvance(e.target.value)

}

className="w-full border rounded-xl p-3"

/>

</div>

<div className="flex justify-between text-lg">

<span>Saldo</span>

<strong className="text-red-600 text-xl">

S/{

Number(pendingSoldTotal || 0) -

Number(pendingAdvance || 0)

}

</strong>

</div>

</div>

)}

      </p>

      <div className="flex flex-col-reverse md:flex-row justify-end gap-3 mt-8">

        <button

          onClick={() =>
            setShowPendingServiceModal(false)
          }

          className="bg-gray-200 px-5 py-3 rounded-2xl"

        >

          Cancelar

        </button>

  <button
  onClick={savePendingSale}
  disabled={pendingSalesCart.length === 0}
  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
    pendingSalesCart.length === 0
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700 text-white"
  }`}
>

  Guardar venta futura

</button>

      </div>

    </div>

  </div>

)}

    </div>

  );
} 