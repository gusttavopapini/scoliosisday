// src/features/public/components/sponsors/AllSponsors.jsx
// Seção única de /patrocinadores: todos os patrocinadores cadastrados na
// coleção, sem filtro por evento. Sem cadastro nenhum, mostra estado vazio
// em vez de sumir — a página inteira gira em torno desta seção, não faz
// sentido ela desaparecer.

import { Building2 } from 'lucide-react';
import SponsorCard from './SponsorCard.jsx';

/** @param {{ emptyTitle: string, emptyBody: string, sponsors: object[] }} props */
export default function AllSponsors({ emptyTitle, emptyBody, sponsors }) {
  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container">
        {sponsors.length > 0 ? (
          <div className="sd-grid sd-grid--4">
            {sponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        ) : (
          <div className="sdp-section-empty" role="status">
            <Building2 size={32} aria-hidden="true" />
            <h3 className="sd-card__title">{emptyTitle}</h3>
            <p>{emptyBody}</p>
          </div>
        )}
      </div>
    </section>
  );
}
