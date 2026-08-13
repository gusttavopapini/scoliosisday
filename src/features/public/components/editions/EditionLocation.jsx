// src/features/public/components/editions/EditionLocation.jsx
// Última seção de /edicoes para a edição atual: local do evento, definido no
// Passo 2 do wizard (EventStep2.jsx/LocationPickerModal.jsx). Só existe
// quando event.location está preenchido — sem seção vazia caso contrário.
// Mapa somente leitura (zoom/pan livres, sem marcador arrastável) + link
// direto pro Google Maps, que não precisa de API key por ser só uma URL de
// busca por coordenadas.

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import '../../../../utils/configureLeafletIcons.js';

/** @param {{ event: object }} props */
export default function EditionLocation({ event }) {
  const { t } = useLanguage();
  const location = event.location;

  if (!location) return null;

  const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal sdp-heading--regular">
            {t.site.locationTitle}
          </h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
        </header>

        <div className="sdp-location">
          <p className="sdp-location__address">
            <MapPin size={18} aria-hidden="true" />
            {location.address}
          </p>

          <div className="sdp-location__map">
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={16}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[location.lat, location.lng]} />
            </MapContainer>
          </div>

          <a
            className="sd-btn sd-btn--outline"
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin size={16} aria-hidden="true" />
            {t.site.locationDirections}
          </a>
        </div>
      </div>
    </section>
  );
}
