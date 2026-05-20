"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function PackagesPage() {

  const [packages,
    setPackages] =
    useState<any[]>([]);

  const [clients,
    setClients] =
    useState<any[]>([]);

  const [services,
    setServices] =
    useState<any[]>([]);

  const [laserZones,
    setLaserZones] =
    useState<any[]>([]);

  const [showModal,
    setShowModal] =
    useState(false);

  const [clientId,
    setClientId] =
    useState("");

  const [serviceId,
    setServiceId] =
    useState("");

  const [laserZoneId,
    setLaserZoneId] =
    useState("");

  const [totalSessions,
    setTotalSessions] =
    useState(1);

  const [unitPrice,
    setUnitPrice] =
    useState(0);

  const [discountPercentage,
    setDiscountPercentage] =
    useState(0);

  const [notes,
    setNotes] =
    useState("");

  // PRIMERA SESIÓN
  const [firstSessionDate,
    setFirstSessionDate] =
    useState("");

  const [firstSessionTime,
    setFirstSessionTime] =
    useState("");

  // TOTAL
  const totalPrice =
    useMemo(() => {

      const discount =
        unitPrice *
        (
          discountPercentage /
          100
        );

      return (
        unitPrice -
        discount
      );

    }, [
      unitPrice,
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
            services(name),
            laser_zones(name)
          `)

          .eq(
            "active",
            true
          )

          .order("id", {
            ascending: false,
          });

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

        .select("*");

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

  // CAMBIO ZONA
  const handleZoneChange =
    (
      value: string
    ) => {

      setLaserZoneId(
        value
      );

      const zone =
        laserZones.find(
          (z) =>
            z.id ===
            parseInt(value)
        );

      if (zone?.price) {

        setUnitPrice(
          Number(
            zone.price
          )
        );
      }
    };

  // GUARDAR
  const savePackage =
    async () => {

      if (
        !clientId ||
        !serviceId
      ) {

        alert(
          "Completa los campos"
        );

        return;
      }

      const { error } =
        await supabase

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

              laser_zone_id:
                laserZoneId
                  ? parseInt(
                      laserZoneId
                    )
                  : null,

              total_sessions:
                totalSessions,

              quantity: 1,

              unit_price:
                unitPrice,

              subtotal:
                unitPrice,

              discount_percentage:
                discountPercentage,

              total_price:
                totalPrice,

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
        "Paquete creado"
      );

      setShowModal(false);

      setClientId("");

      setServiceId("");

      setLaserZoneId("");

      setTotalSessions(1);

      setUnitPrice(0);

      setDiscountPercentage(0);

      setNotes("");

      setFirstSessionDate("");

      setFirstSessionTime("");

      fetchPackages();
    };

  useEffect(() => {

    fetchPackages();

    fetchData();

  }, []);

  return (

    <div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-5xl font-bold text-[#243847] mb-3">

            Paquetes 🎯

          </h2>

          <p className="text-gray-600 text-lg">

            Gestión de paquetes y sesiones

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

      {/* TABLA */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden overflow-x-auto">

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

                Zona

              </th>

              <th className="text-left p-5">

                Sesiones

              </th>

              <th className="text-left p-5">

                Restantes

              </th>

              <th className="text-left p-5">

                Total

              </th>

            </tr>

          </thead>

          <tbody>

            {packages.map(
              (pkg) => (

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

                  <td className="p-5">

                    {
                      pkg.laser_zones
                        ?.name || "-"
                    }

                  </td>

                  <td className="p-5">

                    {
                      pkg.remaining_sessions
                    } / {
                      pkg.total_sessions
                    }

                  </td>

                  <td className="p-5 font-bold text-[#243847]">

                    {
                      pkg.remaining_sessions
                    }

                  </td>

                  <td className="p-5 font-bold">

                    S/
                    {
                      pkg.total_price
                    }

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">

          <div className="bg-white rounded-3xl w-full max-w-[650px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">

            {/* HEADER */}
            <div className="bg-[#243847] text-white px-8 py-6">

              <h3 className="text-3xl font-bold">

                Nuevo paquete

              </h3>

              <p className="opacity-80 mt-1">

                Gestión profesional de sesiones

              </p>

            </div>

            {/* BODY */}
            <div className="p-8 space-y-8 overflow-y-auto">

              {/* INFORMACIÓN */}
              <div>

                <h4 className="text-xl font-bold text-[#243847] mb-5">

                  Información del paquete

                </h4>

                <div className="grid md:grid-cols-2 gap-4">

                  {/* CLIENTE */}
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
                            key={
                              client.id
                            }
                            value={
                              client.id
                            }
                          >

                            {
                              client.full_name
                            }

                          </option>

                        )
                      )}

                    </select>

                  </div>

                  {/* SERVICIO */}
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
                            key={
                              service.id
                            }
                            value={
                              service.id
                            }
                          >

                            {
                              service.name
                            }

                          </option>

                        )
                      )}

                    </select>

                  </div>

                </div>

                {/* ZONA */}
                <div className="mt-4">

                  <label className="block mb-2 font-medium text-gray-700">

                    Zona láser (opcional)

                  </label>

                  <select
                    value={
                      laserZoneId
                    }
                    onChange={(e) =>
                      handleZoneChange(
                        e.target.value
                      )
                    }
                    className="w-full border p-4 rounded-2xl"
                  >

                    <option value="">
                      Seleccione zona láser
                    </option>

                    {laserZones.map(
                      (zone) => (

                        <option
                          key={
                            zone.id
                          }
                          value={
                            zone.id
                          }
                        >

                          {
                            zone.name
                          } - S/
                          {
                            zone.price
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>

              {/* SESIONES */}
              <div>

                <h4 className="text-xl font-bold text-[#243847] mb-5">

                  Sesiones

                </h4>

                <div>

                  <label className="block mb-2 font-medium text-gray-700">

                    Número de sesiones

                  </label>

                  <input
                    type="number"
                    value={
                      totalSessions
                    }
                    onChange={(e) =>
                      setTotalSessions(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full border p-4 rounded-2xl"
                  />

                </div>

              </div>

              {/* PRECIOS */}
              <div>

                <h4 className="text-xl font-bold text-[#243847] mb-5">

                  Precio y descuento

                </h4>

                <div className="grid md:grid-cols-2 gap-4">

                  {/* PRECIO */}
                  <div>

                    <label className="block mb-2 font-medium text-gray-700">

                      Precio

                    </label>

                    <input
                      type="number"
                      value={
                        unitPrice
                      }
                      onChange={(e) =>
                        setUnitPrice(
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-full border p-4 rounded-2xl"
                    />

                  </div>

                  {/* DESCUENTO */}
                  <div>

                    <label className="block mb-2 font-medium text-gray-700">

                      Descuento %

                    </label>

                    <input
                      type="number"
                      value={
                        discountPercentage
                      }
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

                </div>

                {/* TOTAL */}
                <div className="mt-5 bg-[#243847]/5 border-2 border-[#243847] rounded-3xl p-6 text-center">

                  <p className="text-gray-600 text-sm uppercase tracking-wider">

                    Total final

                  </p>

                  <h3 className="text-4xl font-bold text-[#243847] mt-2">

                    S/
                    {totalPrice.toFixed(
                      2
                    )}

                  </h3>

                </div>

              </div>

              {/* PRIMERA SESIÓN */}
              <div>

                <h4 className="text-xl font-bold text-[#243847] mb-5">

                  Primera sesión (opcional)

                </h4>

                <div className="grid md:grid-cols-2 gap-4">

                  {/* FECHA */}
                  <div>

                    <label className="block mb-2 font-medium text-gray-700">

                      Fecha primera sesión

                    </label>

                    <input
                      type="date"
                      value={
                        firstSessionDate
                      }
                      onChange={(e) =>
                        setFirstSessionDate(
                          e.target.value
                        )
                      }
                      className="w-full border p-4 rounded-2xl"
                    />

                  </div>

                  {/* HORA */}
                  <div>

                    <label className="block mb-2 font-medium text-gray-700">

                      Hora aproximada

                    </label>

                    <input
                      type="time"
                      value={
                        firstSessionTime
                      }
                      onChange={(e) =>
                        setFirstSessionTime(
                          e.target.value
                        )
                      }
                      className="w-full border p-4 rounded-2xl"
                    />

                  </div>

                </div>

              </div>

              {/* OBSERVACIONES */}
              <div>

                <h4 className="text-xl font-bold text-[#243847] mb-5">

                  Observaciones

                </h4>

                <textarea
                  placeholder="Notas del paquete"
                  value={notes}
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  className="w-full border p-4 rounded-2xl h-28"
                />

              </div>

            </div>

            {/* FOOTER */}
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
                onClick={
                  savePackage
                }
                className="bg-[#243847] text-white px-6 py-3 rounded-2xl"
              >

                Guardar paquete

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}