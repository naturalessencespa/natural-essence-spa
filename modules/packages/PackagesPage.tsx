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

  const [startDate,
    setStartDate] =
    useState("");

  const [startTime,
    setStartTime] =
    useState("");

  const [selectedZones,
    setSelectedZones] =
    useState<any[]>([]);

  const [totalSessions,
    setTotalSessions] =
    useState(1);

  const [unitPrice,
    setUnitPrice] =
    useState(0);

  const [discountPercentage,
    setDiscountPercentage] =
    useState(0);

  const [notes, setNotes] =
    useState("");

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

  // SUBTOTAL
  const subtotal =
    useMemo(() => {

      return (
        unitPrice *
        totalSessions
      );

    }, [
      unitPrice,
      totalSessions,
    ]);

  // DESCUENTO AUTOMÁTICO
  const automaticDiscount =
    useMemo(() => {

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
    ]);

  // PRECIO PAQUETE
  const packagePrice =
    useMemo(() => {

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
    ]);

  // TOTAL FINAL
  const totalPrice =
    useMemo(() => {

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

      setClients(
        clientsData || []
      );

      setServices(
        servicesData || []
      );

      setLaserZones(
        zonesData || []
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

              start_date:
                startDate,

              start_time:
                startTime,

              total_sessions:
                totalSessions,

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

          sessionDate.setMonth(
            sessionDate.getMonth()
            + i
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

      await supabase

        .from(
          "client_packages"
        )

        .delete()

        .eq("id", id);

      fetchPackages();
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

        newDate.setMonth(
          newDate.getMonth()
          + (i + 1)
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
          onClick={() =>
            setShowModal(true)
          }
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

        <table className="w-full">

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
                            pkg.total_sessions
                          );

                          setUnitPrice(
                            Number(
                              pkg.unit_price
                            )
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
                  onChange={(e) =>
                    setServiceId(
                      e.target.value
                    )
                  }
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

              <div>

                <label className="block mb-2 font-medium text-gray-700">
                  Número de sesiones
                </label>

                <select
                  value={totalSessions}
                  onChange={(e) =>
                    setTotalSessions(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="w-full border p-4 rounded-2xl"
                >

                  <option value={1}>
                    1 sesión
                  </option>

                  <option value={3}>
                    3 sesiones
                  </option>

                  <option value={6}>
                    6 sesiones
                  </option>

                </select>

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
                onClick={() =>
                  setShowModal(false)
                }
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

          <div className="bg-white rounded-3xl w-full max-w-[600px] overflow-hidden">

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

            <div className="p-6">

              <table className="w-full">

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

                  </tr>

                </thead>

                <tbody>

                  {sessionsDetail.map(
                    (session: any) => (

                      <tr
                        key={session.id}
                        className="border-b"
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

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}