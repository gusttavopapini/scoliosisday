// src/features/public/components/sponsors/SponsorCard.jsx
// Card de patrocinador de /patrocinadores — card inteiro é um link para o
// site do patrocinador. Distinto do SponsorCard do painel (outro arquivo,
// outra finalidade: aquele edita, este só exibe).

import SponsorLogo from '../../../../components/SponsorLogo.jsx';

/** @param {{ sponsor: object }} props */
export default function SponsorCard({ sponsor }) {
  return (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noopener noreferrer"
      className="sdp-sponsor-card"
    >
      <div className="sdp-sponsor-card__logo">
        {sponsor.logoUrl ? (
          <SponsorLogo src={sponsor.logoUrl} alt={sponsor.name} maxHeight={96} />
        ) : (
          <span className="sdp-sponsor-card__placeholder">{sponsor.name}</span>
        )}
      </div>
      <p className="sdp-sponsor-card__name">{sponsor.name}</p>
    </a>
  );
}
