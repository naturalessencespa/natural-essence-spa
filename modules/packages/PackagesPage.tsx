"use client";

import { useEffect, useMemo, useState } from "react";

import Select from "react-select";

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

  // MULTISELECT
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

  const [notes,
    setNotes] =
    useState("");

  // TOTAL
  const totalPrice =
    useMemo(() => {

      const subtotal =
        unitPrice *
        totalSessions;

      const discount =
        subtotal *
        (
          discountPercentage /
          100
        );

      return (
        subtotal -
        discount
      );

    }, [
      unitPrice,
      totalSessions,
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

  // GUARDAR
  const savePackage =
    async () => {

      if (
        !clientId ||
        !serviceId
      ) {

        alert(
          "Completa cliente y servicio"
        );

        return;
      }

      // CREAR PAQUETE
      const {
        data,
        error
      } =
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

              total_sessions:
                totalSessions,

              quantity: 1,

              unit_price:
                unitPrice,

              subtotal:
                unitPrice *
                totalSessions,

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

      alert(
        "Paquete creado"
      );

      setShowModal(false);

      setClientId("");

      setServiceId("");

      setSelectedZones([]);

      setTotalSessions(1);

      setUnitPrice(0);

      setDiscountPercentage(0);

      setNotes("");

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

                Sesiones

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
                      pkg.total_sessions
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

          <div className="bg-white rounded-3xl w-full max-w-[700px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">

            {/* HEADER */}
            <div className="bg-[#243847] text-white px-8 py-6">

              <h3 className="text-3xl font-bold">

                Nuevo paquete

              </h3>

            </div>

            {/* BODY */}
            <div className="p-8 overflow-y-auto space-y-6">

              {/* CLIENTE Y SERVICIO */}
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

              {/* ZONAS LASER */}
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

              {/* SESIONES */}
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

              {/* TOTAL */}
              <div className="bg-[#243847]/5 border-2 border-[#243847] rounded-3xl p-6 text-center">

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

              {/* OBSERVACIONES */}
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