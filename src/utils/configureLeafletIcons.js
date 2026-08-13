// src/utils/configureLeafletIcons.js
// Leaflet resolve o ícone padrão do marcador por URL relativa embutida no
// pacote, um caminho que não sobrevive ao bundling do Vite (a imagem some,
// marcador fica invisível). Fix padrão: importar os PNGs como assets (o
// Vite devolve a URL final de cada um) e substituir a resolução default.
// Import só por efeito colateral — cada consumidor do mapa (LocationPickerModal,
// EditionLocation) importa este módulo uma vez antes de renderizar o mapa.

import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
