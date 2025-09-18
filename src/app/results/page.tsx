"use client"

import { ResultsDashboard } from "@/components/results-dashboard"
import { getPhenologicalStage } from "@/lib/phenology";
import { useFarmData } from "@/stores/farmStore";


function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day); // mes es base 0
}

function calcularProximoRiego(frecuenciaRiego: number, fechaReferencia?: Date): string {
  // si no se pasa fecha, toma hoy
  const baseDate = fechaReferencia ? new Date(fechaReferencia) : new Date();

  const proximo = new Date(baseDate);
  proximo.setDate(proximo.getDate() + Math.round(frecuenciaRiego));

  // formatear como "25 Mar"
  return proximo.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}


export default function ResultsPage() {
  const {selectedSoilType, selectedCrop, area, waterFactor, depthRoots, Et0, sowingDate} = useFarmData();

  const phen = getPhenologicalStage(selectedCrop, sowingDate);

  console.log(phen)

  const laminaNeta = phen.kcActual * Et0;

  const depthRoots_cm = depthRoots * 100; // convertir metros → cm

  const CAU = (((selectedSoilType?.CC ?? 0) - (selectedSoilType?.PMP ?? 0))) * (selectedSoilType?.Da ?? 0) * depthRoots_cm * 10;

  const laminaDeRiego = CAU * waterFactor;

  const frecuenciaDeRiego = laminaDeRiego / laminaNeta;

  const resultsData = {
    cultivo: selectedCrop?.name ?? "",
    fechaSiembra: sowingDate,
    tipoSuelo:selectedSoilType?.value ?? "",
    area: area.toString(),
    areaUnit: "m²",
    laminaNeta: laminaNeta,
    volumenDiario: laminaNeta * area,
    frecuenciaRiego: frecuenciaDeRiego,
    proximoRiego: calcularProximoRiego(frecuenciaDeRiego, parseDateLocal(sowingDate)),
    etapaCultivo: phen.stage + (phen.stage === "No sembrado" ? "" : ` (día ${phen.dayOfStage})`),
    kcActual: phen.kcActual,
    eto: Et0,
  }


  console.log(resultsData);

  return <ResultsDashboard data={resultsData} />
}
