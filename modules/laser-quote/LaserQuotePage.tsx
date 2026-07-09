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
        </div>

      </div>


  );

}