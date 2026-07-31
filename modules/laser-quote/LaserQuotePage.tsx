"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LaserQuotePage() {

   

  const [zones, setZones] = useState<any[]>([]);

  const [searchZone, setSearchZone] = useState("");

  const [selectedZones, setSelectedZones] = useState<any[]>([]);

  

  useEffect(() => {

    loadZones();

  }, []);

const calculateQuotation = (
  sessions: number
) => {

  const zonesWithPrice =
    selectedZones.map((zone) => {

      let unitPrice =
        Number(zone.price);

      if (sessions === 3) {

        unitPrice =
          unitPrice * 0.90;

      }

      if (sessions === 6) {

        unitPrice =
          unitPrice * 0.85;

      }

      return {

        ...zone,

        totalPrice:
          unitPrice * sessions

      };

    });

  const subtotal =
    zonesWithPrice.reduce(

      (sum, zone) =>

        sum +
        zone.totalPrice,

      0

    );

  let promotionDiscount = 0;

  let promotionZone = "";

  if (
    zonesWithPrice.length >= 3
  ) {

    let cheapest =
      zonesWithPrice[0];

    zonesWithPrice.forEach(
      (zone) => {

        if (
          zone.totalPrice <
          cheapest.totalPrice
        ) {

          cheapest = zone;

        }

      }
    );

    promotionDiscount =
      cheapest.totalPrice * 0.5;

    promotionZone =
      cheapest.name;

  }

  return {

    subtotal,

    promotionDiscount,

    promotionZone,

    total:
      subtotal -
      promotionDiscount

  };

};

const quotation1 =
  calculateQuotation(1);

const quotation3 =
  calculateQuotation(3);

const quotation6 =
  calculateQuotation(6);

const copyQuotation = async () => {

  const quotations = [

    {
      title: "1 sesión",
      data: quotation1
    },

    {
      title: "3 sesiones",
      data: quotation3
    },

    {
      title: "6 sesiones",
      data: quotation6
    }

  ];

  let message =
`✨ *COTIZACIÓN DEPILACIÓN LÁSER* ✨

📍 *Zonas seleccionadas:*

`;

  selectedZones.forEach((zone) => {

    message += `• ${zone.name}
`;

  });

  message += `
━━━━━━━━━━━━━━

`;

  quotations.forEach((item) => {

   message +=
`💰 *${item.title}*
S/${item.data.total.toFixed(2)}
`;

if (item.title !== "1 sesión") {

  const discountPercent =
    item.title === "3 sesiones"
      ? 10
      : 15;

  const normalPrice =
    selectedZones.reduce(
      (sum, zone) =>
        sum +
        Number(zone.price) *
        (item.title === "3 sesiones" ? 3 : 6),
      0
    );

  const packageSaving =
    normalPrice *
    (discountPercent / 100);

  message +=
`${item.title === "3 sesiones" ? "✅" : "🔥"} Ahorras S/${packageSaving.toFixed(2)}

`;

} else {

  message += `
`;


}

  });

  message += `━━━━━━━━━━━━━━

`;

 if (selectedZones.length >= 3) {

  message +=
`🎁 *Estos precios ya incluyen:*

• Descuento por paquete.
• 50% de descuento en la zona de menor valor (*${quotation1.promotionZone}*).

`;

}

  if (selectedZones.length === 2) {

    message +=
`🎁 *Promoción disponible*

Agrega una zona más y obtén automáticamente 50% de descuento en la zona de menor valor.

`;

  }

  message +=
`💚 Todos nuestros paquetes utilizan tecnología Láser de 4 Ondas.

Quedamos atentos para ayudarte a reservar tu primera sesión.`;

  await navigator.clipboard.writeText(
    message
  );

  alert(
    "Cotización copiada al portapapeles."
  );

};

  const loadZones = async () => {

    const { data } = await supabase

      .from("laser_zones")

      .select(`
id,
name,
price,
active
`)
.eq("active", true)

      .order("name");

    setZones(data || []);

  };

  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold text-[#243847]">

          Calculadora Depilación Láser

        </h1>

       <p className="text-gray-500 mt-2 text-sm md:text-base">

          Cotiza automáticamente las zonas seleccionadas.

        </p>

      </div>

      

     <div className="bg-white rounded-3xl shadow p-4 md:p-6 xl:p-8">

     <div className="mb-8">

 <h2 className="text-2xl font-semibold">

  Zonas disponibles

</h2>


</div>

     <div className="space-y-6">

  <input

    type="text"

    placeholder="Buscar zona..."

    value={searchZone}

    onChange={(e)=>

      setSearchZone(
        e.target.value
      )

    }

   className="w-full border rounded-2xl p-3 md:p-4"

  />

  <div className="border rounded-2xl max-h-[350px] overflow-y-auto">

    {zones

      .filter(

        (zone)=>

          zone.name

            .toLowerCase()

            .includes(

              searchZone.toLowerCase()

            )

      )

      .filter(

        (zone)=>

          !selectedZones.find(

            (item)=>

              item.id===zone.id

          )

      )

      .map((zone)=>{

  let unitPrice = Number(zone.price);

        return(

<div

key={zone.id}

className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b p-4"

>

<div>

<p className="font-semibold">

{zone.name}

</p>

<p className="text-green-600">

Desde S/{Number(zone.price).toFixed(2)}

</p>

</div>

<button

onClick={()=>{

setSelectedZones([

...selectedZones,

{

...zone,

price: Number(zone.price)

}

]);

setSearchZone("");

}}

className="w-full sm:w-auto bg-[#243847] text-white px-4 py-2 rounded-xl"

>

Agregar

</button>

</div>

);

})}

  </div>

</div>

<div className="mt-8">

  <h2 className="text-2xl font-semibold mb-4">

    Zonas seleccionadas

  </h2>

  {selectedZones.length === 0 ? (

    <div className="border rounded-2xl p-6 text-gray-500">

      No hay zonas seleccionadas.

    </div>

  ) : (

    <div className="space-y-3">

{selectedZones.map((zone) => (

  <div

    key={zone.id}

    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border rounded-2xl p-4"

  >

    <div>

      <p className="font-semibold">

        {zone.name}

      </p>

      <p className="text-green-600">

        S/{Number(zone.price).toFixed(2)}

      </p>

    </div>

    <button

      onClick={() =>

        setSelectedZones(

          selectedZones.filter(

            (item) => item.id !== zone.id

          )

        )

      }

      className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-xl"

    >

      Quitar

    </button>

  </div>

))}

    </div>

  )}

</div>

<div className="mt-10 bg-gray-50 rounded-3xl p-4 md:p-6">

  <h2 className="text-xl md:text-2xl font-bold text-[#243847] mb-8">

    Resumen de la cotización

  </h2>

  <div className="space-y-6">

    {[
      {
        title: "1 sesión",
        data: quotation1
      },
      {
        title: "3 sesiones",
        data: quotation3
      },
      {
        title: "6 sesiones",
        data: quotation6
      }
    ].map((item) => (

      <div
        key={item.title}
        className="bg-white rounded-2xl border p-5"
      >

        <h3 className="text-xl font-bold text-[#243847] mb-4">

          {item.title}

        </h3>

        <div className="flex justify-between mb-2">

          <span>

            Subtotal

          </span>

          <strong>

            S/{item.data.subtotal.toFixed(2)}

          </strong>

        </div>

        <div className="flex justify-between mb-2">

          <span>

            Descuento

          </span>

          <strong className="text-green-600">

            -S/{item.data.promotionDiscount.toFixed(2)}

          </strong>

        </div>

        {item.data.promotionZone !== "" && (

          <div className="bg-green-50 border border-green-300 rounded-xl p-3 my-4">

            ✅ 50% aplicado en <strong>{item.data.promotionZone}</strong>

          </div>

        )}

        <div className="flex justify-between border-t pt-4 text-xl font-bold">

          <span>

            TOTAL

          </span>

          <span className="text-[#243847]">

            S/{item.data.total.toFixed(2)}

          </span>

        </div>

      </div>

    ))}

    {selectedZones.length === 2 && (

      <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-5">

        <p className="font-semibold text-yellow-700">

          🎁 Agrega una zona más y obtén 50% de descuento en la zona de menor valor.

        </p>

      </div>

    )}

  </div>

</div>

<div className="flex flex-col sm:flex-row gap-4 mt-8">

  <button

    onClick={() => {

      setSelectedZones([]);


    }}

    className="w-full sm:w-auto bg-gray-300 px-6 py-3 rounded-2xl"

  >

    Limpiar

  </button>

  <button

    onClick={copyQuotation}

    className="w-full sm:w-auto bg-[#243847] text-white px-6 py-3 rounded-2xl"

  >

    Copiar cotización

  </button>

</div>
        </div>

      </div>


  );

}