// src/services/nominatim.js
// Cliente mínimo pro Nominatim (geocoding gratuito do OpenStreetMap, sem API
// key) — usado só pelo LocationPickerModal (busca de endereço e reverse
// geocoding ao posicionar o marcador).
//
// Política de uso (https://operations.osmfoundation.org/policies/nominatim/)
// pede no máx. ~1 req/s e identificação do app via header. `User-Agent` é um
// header proibido pro fetch do navegador — a spec não deixa JS sobrescrevê-lo,
// então não dá pra setar um custom aqui; o Referer que o próprio browser já
// manda identifica a origem, e é a alternativa que a política aceita.
// throttledFetch garante o intervalo mínimo entre requisições mesmo que o
// admin dispare busca e arraste o marcador em sequência rápida.

const BASE_URL = 'https://nominatim.openstreetmap.org';
const MIN_INTERVAL_MS = 1100;

let lastRequestAt = 0;

async function throttledFetch(url) {
  const wait = MIN_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();

  const response = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
  if (!response.ok) throw new Error('Falha ao consultar o Nominatim');
  return response.json();
}

/**
 * Busca endereços por texto livre. Só deve ser chamada por uma ação
 * explícita do admin (botão "Buscar"/Enter) — nunca a cada tecla digitada.
 * @param {string} queryText
 * @returns {Promise<Array<{ lat: number, lng: number, label: string }>>}
 */
export async function searchAddress(queryText) {
  const url = `${BASE_URL}/search?format=jsonv2&limit=5&q=${encodeURIComponent(queryText)}`;
  const results = await throttledFetch(url);
  return results.map((result) => ({
    lat: Number(result.lat),
    lng: Number(result.lon),
    label: result.display_name,
  }));
}

/**
 * Endereço legível pra um ponto do mapa — só uma sugestão pra pré-preencher
 * o campo de texto do modal; o admin sempre pode editar por cima.
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>}
 */
export async function reverseGeocode(lat, lng) {
  const url = `${BASE_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const result = await throttledFetch(url);
  return result?.display_name ?? '';
}
