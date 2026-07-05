"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PendingServicesPage() {

  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");

  const [serviceName, setServiceName] = useState("");

  const [originalPrice, setOriginalPrice] = useState("");

  const [soldPrice, setSoldPrice] = useState("");

  const [advance, setAdvance] = useState("");

  const [origin, setOrigin] = useState("Recepción");

  const [notes, setNotes] = useState("");

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    const { data: clientsData } = await supabase
      .from("clients")
      .select("id, full_name")
      .order("full_name");

    const { data: servicesData } = await supabase
      .from("services")
      .select("id, name, price")
      .order("name");

    setClients(clientsData || []);
    setServices(servicesData || []);

  };

  const selectService = (id: string) => {

    setServiceId(id);

    const service = services.find(
      (s) => s.id === Number(id)
    );

    if (!service) return;

    setServiceName(service.name);

    setOriginalPrice(service.price.toString());

    setSoldPrice(service.price.toString());

  };

  const savePendingService = async () => {

    if (!clientId) {

      alert("Seleccione un cliente.");

      return;

    }

    if (!serviceId) {

      alert("Seleccione un servicio.");

      return;

    }

    if (!soldPrice) {

      alert("Ingrese el precio vendido.");

      return;

    }

    if (!advance) {

      alert("Ingrese el adelanto.");

      return;

    }

    if (Number(advance) > Number(soldPrice)) {

      alert("El adelanto no puede ser mayor al precio.");

      return;

    }

    const { error } = await supabase

      .from("pending_services")

      .insert({

        client_id: Number(clientId),

        service_id: Number(serviceId),

        service_name: serviceName,

        original_price: Number(originalPrice),

        sold_price: Number(soldPrice),

        advance: Number(advance),

        status: "Pendiente",

        origin,

        notes

      });

    if (error) {

      console.log(error);

      alert(error.message);

      return;

    }

    alert("Servicio pendiente registrado.");

    setClientId("");
    setServiceId("");
    setServiceName("");
    setOriginalPrice("");
    setSoldPrice("");
    setAdvance("");
    setOrigin("Recepción");
    setNotes("");

  };

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-5xl font-bold text-[#243847]">

          Servicios Pendientes

        </h1>

        <p className="text-gray-500 mt-2">

          Registro de servicios vendidos sin fecha de atención.

        </p>

      </div>

      <div className="bg-white rounded-3xl shadow p-8">

        <div className="grid grid-cols-2 gap-6">

          <div>

            <label className="block mb-2 font-medium">

              Cliente

            </label>

            <select

              value={clientId}

              onChange={(e) =>
                setClientId(e.target.value)
              }

              className="w-full border rounded-xl p-3"

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

          </div>

          <div>

            <label className="block mb-2 font-medium">

              Servicio

            </label>

            <select

              value={serviceId}

              onChange={(e) =>
                selectService(e.target.value)
              }

              className="w-full border rounded-xl p-3"

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

          </div>

          <div>

            <label className="block mb-2 font-medium">

              Precio catálogo

            </label>

            <input

              value={originalPrice}

              readOnly

              className="w-full border rounded-xl p-3 bg-gray-100"

            />

          </div>

          <div>

            <label className="block mb-2 font-medium">

              Precio vendido

            </label>

            <input

              value={soldPrice}

              onChange={(e) =>
                setSoldPrice(e.target.value)
              }

              className="w-full border rounded-xl p-3"

            />

          </div>

          <div>

            <label className="block mb-2 font-medium">

              Adelanto

            </label>

            <input

              value={advance}

              onChange={(e) =>
                setAdvance(e.target.value)
              }

              className="w-full border rounded-xl p-3"

            />

          </div>

          <div>

            <label className="block mb-2 font-medium">

              Saldo

            </label>

            <input

              readOnly

              value={
                Number(soldPrice || 0) -
                Number(advance || 0)
              }

              className="w-full border rounded-xl p-3 bg-gray-100"

            />

          </div>

          <div>

            <label className="block mb-2 font-medium">

              Origen

            </label>

            <select

              value={origin}

              onChange={(e) =>
                setOrigin(e.target.value)
              }

              className="w-full border rounded-xl p-3"

            >

              <option>Recepción</option>

              <option>Venta adicional</option>

              <option>WhatsApp</option>

            </select>

          </div>

          <div>

            <label className="block mb-2 font-medium">

              Observaciones

            </label>

            <input

              value={notes}

              onChange={(e) =>
                setNotes(e.target.value)
              }

              className="w-full border rounded-xl p-3"

            />

          </div>

        </div>

        <div className="mt-8">

          <button

            onClick={savePendingService}

            className="bg-[#243847] text-white px-8 py-3 rounded-2xl"

          >

            Guardar Servicio Pendiente

          </button>

        </div>

      </div>

    </div>

  );

}