// src/features/public/components/hallofstars/AllSpeakers.jsx
// Seção 2 de /hall-de-estrelas: todos os palestrantes vinculados a alguma
// edição publicada, com busca por nome. Sem cadastro nenhum ainda, mostra
// um estado vazio em vez de sumir — diferente da Seção 1 (que só existe
// quando há destaque), esta é a lista completa e sempre faz sentido exibir
// a seção, mesmo vazia.

import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import PersonCard from '../editions/PersonCard.jsx';

/** @param {{ title: string, searchPlaceholder: string, emptyTitle: string, emptyBody: string, people: object[] }} props */
export default function AllSpeakers({ title, searchPlaceholder, emptyTitle, emptyBody, people }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return people;
    return people.filter((person) => person.fullName?.toLowerCase().includes(term));
  }, [people, search]);

  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal sdp-heading--regular">{title}</h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
        </header>

        {people.length > 0 && (
          <label className="sd-field sdp-hallofstars__search">
            <span className="sr-only">{searchPlaceholder}</span>
            <input
              className="sd-input"
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        )}

        {filtered.length > 0 ? (
          <div className="sd-grid sd-grid--4">
            {filtered.map((person) => (
              <PersonCard key={person.id} person={person} className="sdp-people-card--clamp-2" />
            ))}
          </div>
        ) : people.length > 0 ? (
          <div className="sdp-section-empty" role="status">
            <Users size={32} aria-hidden="true" />
            <p>{t.common.noResults}</p>
          </div>
        ) : (
          <div className="sdp-section-empty" role="status">
            <Users size={32} aria-hidden="true" />
            <h3 className="sd-card__title">{emptyTitle}</h3>
            <p>{emptyBody}</p>
          </div>
        )}
      </div>
    </section>
  );
}
