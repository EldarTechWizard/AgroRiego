export const soilTypes = [
  {
    value: "arenoso",
    label: "Arenoso",
    emoji: "🏖️",
    description: "Suelo con alta permeabilidad, drenaje rápido",
    CC: 0.11, // 11 %
    PMP: 0.05, // 5 %
    Da: 1.6, // g/cm³
  },
  {
    value: "franco-arenoso",
    label: "Franco-arenoso",
    emoji: "🌾",
    description: "Buen drenaje, retención moderada de agua",
    CC: 0.18,
    PMP: 0.09,
    Da: 1.55,
  },
  {
    value: "franco",
    label: "Franco",
    emoji: "🌱",
    description: "Equilibrio ideal entre arena, limo y arcilla",
    CC: 0.28,
    PMP: 0.14,
    Da: 1.4,
  },
  {
    value: "franco-arcilloso",
    label: "Franco-arcilloso",
    emoji: "🌿",
    description: "Buena retención de agua y nutrientes",
    CC: 0.33,
    PMP: 0.18,
    Da: 1.35,
  },
  {
    value: "arcilloso",
    label: "Arcilloso",
    emoji: "🧱",
    description: "Alta retención de agua, drenaje lento",
    CC: 0.38,
    PMP: 0.22,
    Da: 1.25,
  },
];
