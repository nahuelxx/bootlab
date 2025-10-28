// src/utils/normalizers.js

/**
 * Devuelve el crédito estimado en ARS
 * Tolera camelCase (preValuacion) y snake_case (pre_valuacion)
 */
export function getCreditAmount(data) {
  return data?.preValuacion ?? data?.pre_valuacion ?? 0;
}

/**
 * Devuelve el ID del crédito (string único generado por backend)
 */
export function getCreditoId(data) {
  return data?.creditoId ?? data?.credito_id ?? null;
}

/**
 * Devuelve la vigencia en horas del crédito
 */
export function getVigenciaHoras(data) {
  return data?.vigenciaHoras ?? data?.vigencia_horas ?? 48;
}

export function normalizeProduct(p) {
  return {
    id: p.id ?? p.sku ?? p.code,
    name: p.name ?? p.title,
    brand: p.brand ?? p.maker ?? '',
    series: p.series ?? p.family ?? '',
    price: Number(p.price ?? p.amount ?? 0),
    image: p.image ?? p.thumbnail ?? '',
    specs: Array.isArray(p.specs) ? p.specs : [],
    condition: p.condition ?? p.state ?? null,
  };
}