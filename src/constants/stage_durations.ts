export const STAGE_DURATIONS: Record<
  string,
  { inicial: number; desarrollo: number; media: number; final?: number | null }
> = {
  maiz: { inicial: 25, desarrollo: 40, media: 40, final: 20 },
  tomate: { inicial: 30, desarrollo: 40, media: 40, final: 25 },
  frijol: { inicial: 15, desarrollo: 25, media: 35, final: 20 },
  trigo: { inicial: 15, desarrollo: 25, media: 65, final: 45 },
  arroz: { inicial: 30, desarrollo: 30, media: 60, final: 30 },
  papa: { inicial: 25, desarrollo: 30, media: 45, final: 30 },
  alfalfa: { inicial: 10, desarrollo: 30, media: 325, final: null }, // perenne/forraje: sin "final" definido
  sorgo: { inicial: 20, desarrollo: 35, media: 55, final: 20 },
  cebada: { inicial: 15, desarrollo: 25, media: 50, final: 30 },
  algodon: { inicial: 30, desarrollo: 50, media: 90, final: 30 },
  lechuga: { inicial: 20, desarrollo: 30, media: 15, final: 10 },
  zanahoria: { inicial: 20, desarrollo: 30, media: 50, final: 20 },
  chile: { inicial: 30, desarrollo: 35, media: 40, final: 15 },
  pepino: { inicial: 25, desarrollo: 35, media: 25, final: 20 },
  calabacita: { inicial: 25, desarrollo: 35, media: 25, final: 20 }, // proxy pepino
  sandia: { inicial: 20, desarrollo: 30, media: 50, final: 20 },
  melon: { inicial: 25, desarrollo: 35, media: 40, final: 20 },
  garbanzo: { inicial: 15, desarrollo: 25, media: 35, final: 20 }, // proxy frijol
  ajonjoli: { inicial: 20, desarrollo: 40, media: 40, final: 25 }, // sesame ~125 días total (proxy)
  uva: { inicial: 30, desarrollo: 60, media: 60, final: 40 }, // aproximado (uva/vid varía mucho)
  citricos: { inicial: 30, desarrollo: 30, media: 150, final: 30 }, // ciclo largo (aprox.)
  platano: { inicial: 60, desarrollo: 120, media: 120, final: 60 }, // ciclo largo — proxy
  mango: { inicial: 30, desarrollo: 60, media: 150, final: 60 }, // proxy
  jitomate: { inicial: 30, desarrollo: 40, media: 40, final: 25 }, // igual que tomate
};
