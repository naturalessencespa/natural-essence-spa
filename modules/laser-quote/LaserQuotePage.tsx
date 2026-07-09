"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LaserQuotePage() {

    const [
  packageType,
  setPackageType
] = useState(1);

  const [zones, setZones] = useState<any[]>([]);

  const [searchZone, setSearchZone] = useState("");

  const [selectedZones, setSelectedZones] = useState<any[]>([]);

  

  useEffect(() => {

    loadZones();

  }, []);

  const subtotal = selectedZones.reduce(

  (sum, zone) => {

    let unitPrice = Number(zone.price);

    if (packageType === 3) {

      unitPrice *= 0.90;

    }

    if (packageType === 6) {

      unitPrice *= 0.85;

    }

    return sum + (unitPrice * packageType);

  },

  0

);

let promotionDiscount = 0;

let promotionZone = "";

if (selectedZones.length >= 3) {

  let cheapestZone = selectedZones[0];

  let cheapestPrice = Infinity;

  selectedZones.forEach((zone) => {

    let unitPrice = Number(zone.price);

    if (packageType === 3) {

      unitPrice *= 0.90;

    }

    if (packageType === 6) {

      unitPrice *= 0.85;

    }

    const totalPrice =
      unitPrice * packageType;

    if (totalPrice < cheapestPrice) {

      cheapestPrice = totalPrice;

      cheapestZone = zone;

    }

  });

  promotionDiscount =
    cheapestPrice * 0.5;

  promotionZone =
    cheapestZone.name;

}

const total =
  subtotal -
  promotionDiscount;

  const copyQuotation = async () => {

  let message =

`✨ *Cotización Depilación Láser* ✨

📦 *Paquete:*
${packageType} sesión${packageType > 1 ? "es" : ""}

📍 *Zonas seleccionadas:*

`;

  selectedZones.forEach((zone) => {

    let unitPrice = Number(zone.price);

    if (packageType === 3) {

      unitPrice *= 0.90;

    }

    if (packageType === 6) {

      unitPrice *= 0.85;

    }

    const totalPrice =
      unitPrice * packageType;

    message +=

`• ${zone.name}: S/${totalPrice.toFixed(2)}
`;

  });

  message += `

━━━━━━━━━━━━━━

💰 *Subtotal:* S/${subtotal.toFixed(2)}
`;

if (selectedZones.length === 2) {

  message +=

`🎁 *Promoción disponible*

Agregando una zona más obtienes automáticamente *50% de descuento en la zona de menor valor.*

`;

}

  if (promotionDiscount > 0) {

    message +=

`🎁 *Promoción aplicada:*
50% de descuento en ${promotionZone}

Descuento: -S/${promotionDiscount.toFixed(2)}

`;

  }

  message +=

`💵 *Total:* S/${total.toFixed(2)}

Quedamos atentos para ayudarte a reservar tu primera sesión. 💚`;

  await navigator.clipboard.writeText(message);

  alert("Cotización copiada al portapapeles.");

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

        <h1 className="text-5xl font-bold text-[#243847]">

          Calculadora Depilación Láser

        </h1>

        <p className="text-gray-500 mt-2">

          Cotiza automáticamente las zonas seleccionadas.

        </p>

      </div>

      

      <div className="bg-white rounded-3xl shadow p-8">

     <div className="mb-8">

  <h2 className="text-2xl font-semibold">

    Selecciona el paquete

  </h2>

  <div className="flex gap-4 mt-5">

    <button

      onClick={() =>
        setPackageType(1)
      }

      className={`px-6 py-3 rounded-2xl ${
        packageType === 1
          ? "bg-[#243847] text-white"
          : "bg-gray-200"
      }`}

    >

      1 sesión

    </button>

    <button

      onClick={() =>
        setPackageType(3)
      }

      className={`px-6 py-3 rounded-2xl ${
        packageType === 3
          ? "bg-[#243847] text-white"
          : "bg-gray-200"
      }`}

    >

      3 sesiones

    </button>

    <button

      onClick={() =>
        setPackageType(6)
      }

      className={`px-6 py-3 rounded-2xl ${
        packageType === 6
          ? "bg-[#243847] text-white"
          : "bg-gray-200"
      }`}

    >

      6 sesiones

    </button>

  </div>

  <h2 className="text-2xl font-semibold mt-10">

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

    className="w-full border rounded-2xl p-4"

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

if (packageType === 3) {

  unitPrice = unitPrice * 0.90;

}

if (packageType === 6) {

  unitPrice = unitPrice * 0.85;

}

const price = unitPrice * packageType;

        return(

<div

key={zone.id}

className="flex justify-between items-center border-b p-4"

>

<div>

<p className="font-semibold">

{zone.name}

</p>

<p className="text-green-600">

S/{price.toFixed(2)}

</p>

</div>

<button

onClick={()=>{

setSelectedZones([

...selectedZones,

{

...zone,

price

}

]);

setSearchZone("");

}}

className="bg-[#243847] text-white px-4 py-2 rounded-xl"

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

      {selectedZones.map((zone) => {

        let unitPrice = Number(zone.price);

        if (packageType === 3) {

          unitPrice *= 0.90;

        }

        if (packageType === 6) {

          unitPrice *= 0.85;

        }

        const totalPrice =
          unitPrice * packageType;

        return (

          <div

            key={zone.id}

            className="flex justify-between items-center border rounded-2xl p-4"

          >

            <div>

              <p className="font-semibold">

                {zone.name}

              </p>

              <p className="text-green-600">

                S/{totalPrice.toFixed(2)}

              </p>

            </div>

            <button

              onClick={() =>

                setSelectedZones(

                  selectedZones.filter(

                    (item) =>

                      item.id !== zone.id

                  )

                )

              }

              className="bg-red-500 text-white px-4 py-2 rounded-xl"

            >

              Quitar

            </button>

          </div>

        );

      })}

    </div>

  )}

</div>

<div className="mt-10 bg-gray-50 rounded-3xl p-6">

  <h2 className="text-2xl font-bold text-[#243847] mb-6">

    Resumen de la cotización

  </h2>

  <div className="flex justify-between mb-3">

    <span>

      Cantidad de zonas

    </span>

    <strong>

      {selectedZones.length}

    </strong>

  </div>

  <div className="flex justify-between mb-3">

    <span>

      Tipo de paquete

    </span>

    <strong>

      {packageType} sesión{packageType > 1 ? "es" : ""}

    </strong>

  </div>

  <div className="flex justify-between mb-3">

  <span>

    Subtotal

  </span>

  <strong>

    S/{subtotal.toFixed(2)}

  </strong>

</div>

<div className="flex justify-between mb-3">

  <span>

    Descuento

  </span>

  <strong className="text-green-600">

    -S/{promotionDiscount.toFixed(2)}

  </strong>

</div>

{promotionZone !== "" && (

<div className="bg-green-50 border border-green-300 rounded-2xl p-4 mb-4">

  ✅ 50% aplicado en:

  <strong>

    {" "}

    {promotionZone}

  </strong>

</div>

)}

<div className="flex justify-between border-t pt-5 text-2xl font-bold">

  <span>

    TOTAL

  </span>

  <span className="text-[#243847]">

    S/{total.toFixed(2)}

  </span>

</div>


{selectedZones.length === 2 && (

  <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-2xl p-5">

    <p className="font-semibold text-yellow-700">

      🎁 Agrega una zona más y obtén 50% de descuento en la zona de menor valor.

    </p>

  </div>

)}

{selectedZones.length >= 3 && (

  <div className="mt-6 bg-green-50 border border-green-300 rounded-2xl p-5">

    <p className="font-semibold text-green-700">

      ✅ Promoción aplicada correctamente.

    </p>

  </div>

)}


</div>

<div className="flex gap-4 mt-8">

  <button

    onClick={() => {

      setSelectedZones([]);

      setPackageType(1);

    }}

    className="bg-gray-300 px-6 py-3 rounded-2xl"

  >

    Limpiar

  </button>

  <button

    onClick={copyQuotation}

    className="bg-[#243847] text-white px-6 py-3 rounded-2xl"

  >

    Copiar cotización

  </button>

</div>
        </div>

      </div>


  );

}