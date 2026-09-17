"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import jsPDF from "jspdf";

import { supabase } from "@/lib/supabase";

type Service = {
  id: number;
  name: string;
  price: number | null;
  duration: string;
  description?: string;
  protocol_url?: string;
  protocol_text?: string;
  allow_packages?: boolean;
  branch_price?: number | null;
  branch_active?: boolean;
  branch_configured?: boolean;
};

export default function ServicesPage({
  selectedBranch,
}: {
  selectedBranch: number;
}) {

  const [services, setServices] =
    useState<Service[]>([]);

  const [name, setName] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [duration, setDuration] =
    useState("");

  const [allowPackages,
    setAllowPackages] =
    useState(false);

  const [protocolUrl,
    setProtocolUrl] =
    useState("");

  const [protocolFile,
    setProtocolFile] =
    useState<File | null>(null);

  const [editingId,
    setEditingId] =
    useState<number | null>(null);

  const [sortBy,
    setSortBy] =
    useState("id");

    const [
  showProtocolModal,
  setShowProtocolModal
] = useState(false);

const [
  protocolText,
  setProtocolText
] = useState("");

const [
  selectedServiceId,
  setSelectedServiceId
] = useState<number | null>(null);

  // OBTENER SERVICIOS
  
  const fetchServices = async () => {

  if (!selectedBranch) return;

  const { data: servicesData, error: servicesError } =
    await supabase
      .from("services")
      .select("*")
      .order("id", {
        ascending: false,
      });

  if (servicesError) {
    console.log(servicesError);
    return;
  }

  const { data: branchServicesData, error: branchServicesError } =
    await supabase
      .from("branch_services")
      .select("*")
      .eq("branch_id", selectedBranch);

  if (branchServicesError) {
    console.log(branchServicesError);
    return;
  }

  const servicesWithBranchData =
    (servicesData || []).map((service) => {

      const branchService =
        (branchServicesData || []).find(
          (item) =>
            Number(item.service_id) ===
            Number(service.id)
        );

      return {
        id: service.id,
        name: service.name,
        price: service.price,
        duration: service.duration,
        description: service.description,
        protocol_url: service.protocol_url,
        protocol_text: service.protocol_text,
        allow_packages: service.allow_packages,
              branch_price:
          branchService?.price ?? null,
        branch_active:
          branchService?.active ?? false,
        branch_configured:
          !!branchService,
      };
    });

  setServices(servicesWithBranchData);
};

  // CARGAR
  useEffect(() => {

    fetchServices();

  }, [selectedBranch]);

    // GUARDAR
  const saveService = async () => {

      if (
      !name ||
      !duration ||
      !selectedBranch ||
      !price ||
      Number(price) <= 0
    ) {
      alert(
        "Completa nombre, precio y duración del servicio."
      );
      return;
    }

    let uploadedProtocolUrl =
      protocolUrl;

    // SUBIR PDF
    if (protocolFile) {

      const fileName =
        `${Date.now()}-${protocolFile.name}`;

      const { error } =
        await supabase.storage

          .from("protocols")

          .upload(
            fileName,
            protocolFile
          );

      if (!error) {

        const { data } =
          supabase.storage

            .from("protocols")

            .getPublicUrl(
              fileName
            );

        uploadedProtocolUrl =
          data.publicUrl;
      }
    }

    // EDITAR SERVICIO
    if (editingId) {

      const { error: serviceError } =
        await supabase

          .from("services")

          .update({

            name,

            duration,

            allow_packages:
              allowPackages,

            protocol_url:
              uploadedProtocolUrl,

          })

          .eq(
            "id",
            editingId
          );

      if (serviceError) {

        console.log(serviceError);

        alert(
          "Error actualizando servicio"
        );

        return;
      }

      // ACTUALIZAR PRECIO DE LA SEDE
  const { data: existingBranchService } =
  await supabase

    .from("branch_services")

    .select("id, active")

    .eq(
      "branch_id",
      selectedBranch
    )

    .eq(
      "service_id",
      editingId
    )

    .maybeSingle();

      if (existingBranchService) {

        const { error: branchError } =
          await supabase

            .from("branch_services")

           .update({

              price:
                Number(price),

              active:
                existingBranchService.active,

              updated_at:
                new Date().toISOString(),

            })

            .eq(
              "id",
              existingBranchService.id
            );

        if (branchError) {

          console.log(branchError);

          alert(
            "Error actualizando precio de la sede"
          );

          return;
        }

      } else {

        const { error: branchError } =
          await supabase

            .from("branch_services")

            .insert({

              branch_id:
                selectedBranch,

              service_id:
                editingId,

              price:
                Number(price),

              active:
                true,

            });

        if (branchError) {

          console.log(branchError);

          alert(
            "Error creando precio de la sede"
          );

          return;
        }
      }

      setEditingId(null);

    } else {

      // CREAR SERVICIO GLOBAL
      const { data: newService, error } =
        await supabase

          .from("services")

          .insert([
            {

              name,

              price:
                null,

              duration,

              allow_packages:
                allowPackages,

              protocol_url:
                uploadedProtocolUrl,

            },
          ])

          .select()

          .single();

      if (error || !newService) {

        console.log(error);

        alert(
          "Error creando servicio"
        );

        return;
      }

      // CREAR PRECIO PARA LA SEDE ACTIVA
      const { error: branchError } =
        await supabase

          .from("branch_services")

          .insert({

            branch_id:
              selectedBranch,

            service_id:
              newService.id,

            price:
              Number(price),

            active:
              true,

          });

      if (branchError) {

        console.log(branchError);

        alert(
          "Servicio creado, pero hubo un error guardando el precio de la sede."
        );

        return;
      }
    }

    // LIMPIAR
    setName("");

    setPrice("");

    setDuration("");

    setAllowPackages(false);

    setProtocolUrl("");

    setProtocolFile(null);

    fetchServices();
  };
  

   // ELIMINAR SERVICIO DE LA SEDE
  const deleteService =
    async (id: number) => {

      const confirmDelete =
        confirm(
          "¿Deseas desactivar este servicio para la sede actual?"
        );

      if (!confirmDelete) {
        return;
      }

           const { data: branchService, error: findError } =
        await supabase
          .from("branch_services")
          .select("id")
          .eq("branch_id", selectedBranch)
          .eq("service_id", id)
          .maybeSingle();

      if (findError) {
        console.log(findError);
        alert(
          "Error verificando el servicio en la sede"
        );
        return;
      }

      if (!branchService) {
        alert(
          "Este servicio todavía no está configurado en esta sede."
        );
        return;
      }

      const { error } =
        await supabase
          .from("branch_services")
          .update({
            active: false,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", branchService.id);

      if (error) {
        console.log(error);
        alert(
          "Error desactivando el servicio"
        );
        return;
      }

           alert(
        "Servicio desactivado para la sede actual"
      );

        fetchServices();
    };

  // ACTIVAR SERVICIO EN LA SEDE
  const activateService =
    async (id: number) => {

      const { data: branchService, error: findError } =
        await supabase
          .from("branch_services")
          .select("id")
          .eq("branch_id", selectedBranch)
          .eq("service_id", id)
          .maybeSingle();

      if (findError) {
        console.log(findError);
        alert(
          "Error verificando el servicio en la sede"
        );
        return;
      }

      if (!branchService) {
        alert(
          "Este servicio todavía no está configurado en esta sede."
        );
        return;
      }

      const { error } =
        await supabase
          .from("branch_services")
          .update({
            active: true,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", branchService.id);

      if (error) {
        console.log(error);
        alert(
          "Error activando el servicio"
        );
        return;
      }

      alert(
        "Servicio activado para la sede actual"
      );

      fetchServices();
    };

  // EDITAR
  const editService =
    (service: Service) => {

      setEditingId(service.id);

      setName(service.name);

      setPrice(
        service.branch_price !== null &&
        service.branch_price !== undefined
          ? String(service.branch_price)
          : ""
      );

      setDuration(service.duration);

      setAllowPackages(
        service.allow_packages ?? false
      );

      setProtocolUrl(
        service.protocol_url ?? ""
      );

      setProtocolFile(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  return (

    <div>

      {/* HEADER */}
      <div className="mb-8">

        <h2 className="text-2xl md:text-3xl font-bold">

          Servicios Premium ✨

        </h2>

        <p className="text-gray-600 mt-3 text-lg">

          Gestión completa de servicios

        </p>

      </div>

      {/* FORMULARIO */}
      <div className="bg-white p-8 rounded-3xl shadow-xl mb-10">

        <h3 className="text-2xl font-bold text-[#243847] mb-6">

          {editingId
            ? "Editar Servicio"
            : "Agregar Servicio"}

        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* NOMBRE */}
          <input
            type="text"
            placeholder="Nombre del servicio"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl"
          />

          {/* PRECIO */}
          <input
            type="number"
            placeholder="Precio"
            value={price}
            onChange={(e) =>
              setPrice(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl"
          />

          {/* DURACIÓN */}
          <input
            type="text"
            placeholder="Duración"
            value={duration}
            onChange={(e) =>
              setDuration(
                e.target.value
              )
            }
            className="border p-4 rounded-2xl"
          />

          {/* PDF */}
          <label className="border p-4 rounded-2xl flex items-center justify-center cursor-pointer bg-[#f4f7f9] hover:bg-[#e8eef2] transition text-[#243847] font-medium shadow-sm">

            <div className="flex flex-col items-center">

              <span className="text-2xl mb-1">

                📄

              </span>

              <span className="text-sm text-center">

                {protocolFile
                  ? protocolFile.name
                  : "Subir Protocolo PDF"}

              </span>

            </div>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {

                if (
                  e.target.files?.[0]
                ) {

                  setProtocolFile(
                    e.target.files[0]
                  );
                }

              }}
              className="hidden"
            />

          </label>

        </div>

        {/* CHECKBOX */}
        <div className="flex flex-wrap items-center gap-3 mt-5">

          <input
            type="checkbox"
            checked={
              allowPackages
            }
            onChange={(e) =>
              setAllowPackages(
                e.target.checked
              )
            }
            className="w-5 h-5"
          />

          <label className="font-medium text-gray-700">

            Permitir paquetes

          </label>

        </div>

        {/* BOTÓN */}
        <button
          onClick={saveService}
          className="mt-6 w-full md:w-auto bg-[#243847] text-white px-6 py-3 rounded-2xl hover:opacity-90 transition"
        >

          {editingId
            ? "Actualizar Servicio"
            : "Guardar Servicio"}

        </button>

      </div>

      {/* ORDENAMIENTO */}
    <div className="flex justify-start md:justify-end mb-4">

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value
            )
          }
         className="border p-3 rounded-2xl bg-white w-full md:w-auto"
        >

          <option value="id">
            Más recientes
          </option>

          <option value="name">
            Nombre A-Z
          </option>

          <option value="price">
            Precio menor a mayor
          </option>

        </select>

      </div>

      {/* TABLA */}
      <div className="bg-white rounded-3xl shadow-xl overflow-x-auto">

        <table className="min-w-[1300px] w-full">

          <thead className="bg-[#dbe8ee]">

            <tr>

              <th className="text-left p-5">
                Servicio
              </th>

              <th className="text-left p-5">
                Precio
              </th>

              <th className="text-left p-5">
                Duración
              </th>

              <th className="text-left p-5">
                Paquetes
              </th>

              <th className="text-left p-5">
                Protocolo
              </th>

              <th className="text-left p-5">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

                      {services
              .slice()
              .sort((a, b) => {

                if (
                  sortBy === "name"
                ) {

                  return a.name.localeCompare(
                    b.name
                  );
                }

                if (
                  sortBy === "price"
                ) {

                  return (
                    Number(a.branch_price ?? 0) -
                    Number(b.branch_price ?? 0)
                  );
                }

                return (
                  b.id - a.id
                );
              })

              .map((service) => (

                <tr
                  key={service.id}
                  className="border-t"
                >
                                      <td className="p-5 font-medium">

                    <div>
                      {service.name}

                          {!service.branch_configured && (
      <span className="block text-xs text-gray-400 mt-1">
        No configurado en esta sede
      </span>
      )}

      {service.branch_configured &&
      !service.branch_active && (
      <span className="block text-xs text-red-500 mt-1">
        Inactivo en esta sede
      </span>
      )}
                    </div>

                  </td>

                  <td className="p-5">

                    {service.branch_price !== null &&
                    service.branch_price !== undefined
                      ? `S/ ${service.branch_price}`
                      : "Sin precio configurado"}

                  </td>
                  <td className="p-5">

                    {service.duration}

                  </td>

                  {/* PAQUETES */}
                  <td className="p-5">

                    {service.allow_packages ? (

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-sm font-medium">

                        Sí

                      </span>

                    ) : (

                      <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-xl text-sm font-medium">

                        No

                      </span>

                    )}

                  </td>

                  {/* PDF */}
   <td className="p-5">

  {service.protocol_url ? (

    <div className="flex flex-col gap-2">

    <a
  href={service.protocol_url}
  target="_blank"
  className="bg-[#243847] text-white px-4 py-2 rounded-xl hover:opacity-90 transition text-center inline-block"
>

  Ver PDF

</a>

    </div>

  ) : (

    <span className="text-gray-400">

      Sin protocolo

    </span>

  )}

</td>

                  {/* ACCIONES */}
                  <td className="p-5">

                    <div className="flex flex-wrap gap-2">

                      {/* EDITAR */}
                      <button
                        onClick={() =>
                          editService(
                            service
                          )
                        }
                        className="bg-blue-100 p-2 md:p-3 rounded-xl hover:scale-105 transition"
                      >

                        <Pencil size={18} />

                      </button>

                            {/* ACTIVAR / ELIMINAR */}
                            {service.branch_active ? (
                              <button
                                onClick={() =>
                                  deleteService(
                                    service.id
                                  )
                                }
                                className="bg-red-100 p-2 md:p-3 rounded-xl hover:scale-105 transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  activateService(
                                    service.id
                                  )
                                }
                                className="bg-green-100 px-3 py-2 md:px-4 md:py-3 rounded-xl hover:scale-105 transition font-medium text-green-700"
                              >
                                Activar
                              </button>
                            )}

                      <button
onClick={async () => {

  console.log(
  "CLICK IA"
);
  setSelectedServiceId(
    service.id
  );

  setShowProtocolModal(
    true
  );

  setProtocolText(
    "Generando protocolo..."
  );

  try {

    const response =
    
      await fetch(

        "/api/generate-protocol",

        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

        body: JSON.stringify({

          serviceName:
            service.name,

          duration:
            service.duration,

          description:
            "Servicio profesional de spa y estética"

        }),

        }

      );

      console.log(response);

    const data =
      await response.json();

      console.log(data);

    setProtocolText(
      data.protocol || ""
    );

    setShowProtocolModal(
  true
);

    console.log(
  data.protocol
);

  } catch (error) {

  console.log(error);

  alert(
    "Error generando protocolo"
  );

  setShowProtocolModal(
    false
  );

}

}}

 className="bg-violet-600 text-white px-3 py-2 rounded-2xl text-sm"

>

  Generar IA

</button>

<button

  onClick={() => {

    setSelectedServiceId(
      service.id
    );

    setProtocolText(
      service.protocol_text || ""
    );

    setShowProtocolModal(
      true
    );

  }}

  className="bg-emerald-600 text-white px-3 py-2 rounded-2xl text-sm"

>

  Ver Protocolo

</button>

                    </div>

                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

      {/* MODAL PROTOCOLO */}
{showProtocolModal && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl p-5 md:p-8 w-full max-w-5xl max-h-[95vh] overflow-y-auto">

      <h3 className="text-2xl font-bold text-[#243847] mb-6">

        Protocolo IA

      </h3>

      <textarea

        value={protocolText}

        onChange={(e) =>
          setProtocolText(
            e.target.value
          )
        }

        placeholder="Aquí aparecerá el protocolo generado..."

        className="w-full h-[500px] border p-4 rounded-2xl"

      />

    <div className="flex flex-col-reverse md:flex-row gap-4 mt-6">

        <button

          onClick={() =>
            setShowProtocolModal(
              false
            )
          }

          className="w-full md:w-auto bg-gray-200 px-5 py-3 rounded-2xl"

        >

          Cancelar

        </button>

        <button

         className="w-full md:w-auto bg-violet-600 text-white px-5 py-3 rounded-2xl"

        >

          Generar IA

        </button>

      <button

  onClick={async () => {

    if (
      !selectedServiceId
    ) return;

const pdf =
  new jsPDF();

pdf.setFontSize(12);

const lines =
  pdf.splitTextToSize(
    protocolText,
    180
  );

let y = 10;

const pageHeight =
  pdf.internal.pageSize.height;

lines.forEach(
  (line: string) => {

    if (y > pageHeight - 10) {

      pdf.addPage();

      y = 10;
    }

    pdf.text(
      line,
      10,
      y
    );

    y += 7;

  }
);

const pdfBlob =
  pdf.output("arraybuffer");

const fileName =
  `protocol-${selectedServiceId}-${Date.now()}.pdf`;

const { error: uploadError } =
  await supabase.storage

    .from("protocols")

    .upload(

      fileName,

       new Uint8Array(
    pdfBlob
  ),

      {
        upsert: true,
        contentType:
          "application/pdf",
      }

    );

if (uploadError) {

  console.log(
    "UPLOAD ERROR:",
    uploadError
  );

  alert(
    JSON.stringify(
      uploadError
    )
  );

  return;
}

const { data: publicData } =
  supabase.storage

    .from("protocols")

    .getPublicUrl(
      fileName
    );

const pdfUrl =
  publicData.publicUrl;

    const { error } =
      await supabase

        .from("services")

        .update({

  protocol_text:
    protocolText,

  protocol_url:
    pdfUrl,

})

        .eq(
          "id",
          selectedServiceId
        );

    if (error) {

      console.log(error);

      alert(
        "Error guardando protocolo"
      );

      return;
    }

    alert(
      "Protocolo guardado"
    );

    fetchServices();

    setShowProtocolModal(
      false
    );

  }}

className="w-full min-h-[320px] md:min-h-[500px] border p-4 rounded-2xl"

>

  Guardar protocolo

</button>

      </div>

    </div>

  </div>

)}

    </div>
  );
}