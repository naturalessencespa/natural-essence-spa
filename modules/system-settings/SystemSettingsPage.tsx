"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  selectedBranch: number;
};

export default function SystemSettingsPage({
  selectedBranch,
}: Props) {
  const [additionalSale, setAdditionalSale] =
    useState("");

  const [productSale, setProductSale] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    loadSettings();
  }, [selectedBranch]);

  async function loadSettings() {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("branch_id", selectedBranch)
      .eq("category", "commission");

    if (error) {
      console.error(error);
      return;
    }

    const additional = data.find(
      (x) =>
        x.setting_key ===
        "additional_sale"
    );

    const product = data.find(
      (x) =>
        x.setting_key ===
        "product_sale"
    );

    setAdditionalSale(
      additional?.setting_value ?? ""
    );

    setProductSale(
      product?.setting_value ?? ""
    );
  }

async function saveSettings() {
  setLoading(true);

  const settings = [
    {
      setting_key: "additional_sale",
      setting_value: additionalSale,
      description: "Comisión por venta adicional",
    },
    {
      setting_key: "product_sale",
      setting_value: productSale,
      description: "Comisión por venta de productos",
    },
  ];

  for (const setting of settings) {
    const { data } = await supabase
      .from("system_settings")
      .select("id")
      .eq("branch_id", selectedBranch)
      .eq("category", "commission")
      .eq("setting_key", setting.setting_key)
      .maybeSingle();

    if (data) {
      await supabase
        .from("system_settings")
        .update({
          setting_value: setting.setting_value,
          description: setting.description,
        })
        .eq("id", data.id);
    } else {
      await supabase
        .from("system_settings")
        .insert({
          branch_id: selectedBranch,
          category: "commission",
          setting_key: setting.setting_key,
          setting_value: setting.setting_value,
          description: setting.description,
        });
    }
  }

  alert("Comisiones actualizadas correctamente.");

  setLoading(false);

  loadSettings();
}

  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-2xl">

      <h1 className="text-2xl font-bold text-[#243847] mb-8">
        Parámetros
      </h1>

      <h2 className="text-xl font-semibold mb-6">
        Comisiones
      </h2>

      <div className="space-y-6">

        <div>

          <label className="block font-medium mb-2">
            Venta adicional (%)
          </label>

          <input
            type="number"
            value={additionalSale}
            onChange={(e) =>
              setAdditionalSale(
                e.target.value
              )
            }
            className="w-40 border rounded-xl px-4 py-2"
          />

        </div>

        <div>

          <label className="block font-medium mb-2">
            Venta de productos (%)
          </label>

          <input
            type="number"
            value={productSale}
            onChange={(e) =>
              setProductSale(
                e.target.value
              )
            }
            className="w-40 border rounded-xl px-4 py-2"
          />

        </div>

        <button
          onClick={saveSettings}
          disabled={loading}
          className="bg-[#243847] text-white px-6 py-3 rounded-xl hover:bg-[#1b2c37]"
        >

          {loading
            ? "Guardando..."
            : "Guardar cambios"}

        </button>

      </div>

    </div>
  );
}