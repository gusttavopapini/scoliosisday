// src/components/form/LocationPickerModal.jsx
// Modal de seleção de local no mapa — usado pelo campo "Local do evento" do
// Passo 2 do wizard de Edições (EventStep2.jsx). Leaflet + OpenStreetMap,
// sem API key: clique ou arrasto no mapa posicionam o marcador; a busca de
// endereço usa o Nominatim (services/nominatim.js).
//
// Confirmar só devolve o objeto { lat, lng, address } pro onConfirm do
// chamador (que atualiza o campo do formulário via Controller) — a escrita
// no Firestore só acontece no submit do formulário principal, como qualquer
// outro campo controlado deste wizard.

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Search } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { searchAddress, reverseGeocode } from '../../services/nominatim.js';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  PRECISE_MAP_ZOOM,
} from '../../features/events/constants/mapDefaults.js';
import '../../utils/configureLeafletIcons.js';

/** Sem elemento visual — só ouve cliques do mapa e devolve o ponto clicado. */
function ClickToPlace({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

/**
 * MapContainer só lê `center`/`zoom` na primeira renderização — mudar essas
 * props depois não recentra o mapa (comportamento conhecido do
 * react-leaflet). `target` muda de referência a cada resultado de busca
 * escolhido, e é isso que dispara o flyTo aqui.
 */
function FlyToTarget({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], PRECISE_MAP_ZOOM);
  }, [target, map]);
  return null;
}

/**
 * @param {{
 *   initialLocation: { lat: number, lng: number, address: string } | null,
 *   onConfirm: (location: { lat: number, lng: number, address: string }) => void,
 *   onClose: () => void,
 * }} props
 */
export default function LocationPickerModal({ initialLocation, onConfirm, onClose }) {
  const [position, setPosition] = useState(
    initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : DEFAULT_MAP_CENTER,
  );
  const [address, setAddress] = useState(initialLocation?.address ?? '');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);

  async function placeMarker(lat, lng) {
    setPosition({ lat, lng });
    try {
      const label = await reverseGeocode(lat, lng);
      // Só sugestão: uma falha (ou resposta vazia) do Nominatim não deve
      // apagar o que o admin já tinha digitado.
      if (label) setAddress(label);
    } catch {
      // Sem retry/alerta — o admin sempre pode digitar o endereço na mão.
    }
  }

  async function handleSearch() {
    const term = searchTerm.trim();
    if (!term) return;
    setIsSearching(true);
    try {
      setSearchResults(await searchAddress(term));
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function pickResult(result) {
    setSearchResults([]);
    setSearchTerm(result.label);
    setPosition({ lat: result.lat, lng: result.lng });
    setAddress(result.label);
    setFlyTarget({ lat: result.lat, lng: result.lng });
  }

  function handleConfirm() {
    onConfirm({ lat: position.lat, lng: position.lng, address: address.trim() });
    onClose();
  }

  return (
    <Modal
      labelledBy="location-picker-title"
      onClose={onClose}
      panelClassName="sda-modal__panel--wide"
    >
      <div className="sda-modal__head">
        <h2 id="location-picker-title">Selecionar localização</h2>
        <button
          className="sd-btn sd-btn--ghost sd-btn--sm"
          type="button"
          onClick={onClose}
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>

      <div className="sda-modal__body">
        <div className="sda-locationpicker__search">
          <input
            className="sd-input"
            type="text"
            placeholder="Buscar endereço…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch();
              }
            }}
          />
          <button
            type="button"
            className="sd-btn sd-btn--outline sd-btn--sm"
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
          >
            <Search size={16} aria-hidden="true" />
            {isSearching ? 'Buscando…' : 'Buscar'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <ul className="sda-locationpicker__results">
            {searchResults.map((result) => (
              <li key={`${result.lat}-${result.lng}`}>
                <button type="button" onClick={() => pickResult(result)}>
                  {result.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="sda-locationpicker__map">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={initialLocation ? PRECISE_MAP_ZOOM : DEFAULT_MAP_ZOOM}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[position.lat, position.lng]}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const latlng = event.target.getLatLng();
                  placeMarker(latlng.lat, latlng.lng);
                },
              }}
            />
            <ClickToPlace onPick={placeMarker} />
            <FlyToTarget target={flyTarget} />
          </MapContainer>
        </div>

        <label className="sd-field">
          <span className="sd-label">Endereço exibido publicamente</span>
          <input
            className="sd-input"
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Ex: Centro de Convenções de Pernambuco, Recife - PE"
          />
          <span className="sd-note">
            Pré-preenchido a partir do ponto marcado, mas sempre editável — o
            texto aqui é exatamente o que aparece na página pública.
          </span>
        </label>
      </div>

      <div className="sda-modal__foot">
        <button type="button" className="sd-btn sd-btn--outline" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="sd-btn sd-btn--primary"
          onClick={handleConfirm}
          disabled={!address.trim()}
        >
          Confirmar localização
        </button>
      </div>
    </Modal>
  );
}
