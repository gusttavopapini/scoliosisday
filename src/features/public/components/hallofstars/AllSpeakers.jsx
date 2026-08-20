// src/features/public/components/hallofstars/AllSpeakers.jsx
// Única seção de /hall-de-estrelas: todos os palestrantes cadastrados,
// com busca por nome. Antes era a "Seção 2", abaixo de uma seção de
// destaques que foi removida junto com a distinção que ela representava.
//
// Sem heading próprio: o título da página já vem do <SimpleHero>, e um
// segundo título logo abaixo dele ("Todos os palestrantes") só fazia
// sentido quando havia outra seção acima para contrastar.
//
// Sem cadastro nenhum, mostra um estado vazio em vez de sumir — esta é a
// lista completa e sempre faz sentido exibir a seção, mesmo vazia.

import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import PeopleGrid from '../editions/PeopleGrid.jsx';

/** @param {{ searchPlaceholder: string, emptyTitle: string, emptyBody: string, people: object[] }} props */
export default function AllSpeakers({ searchPlaceholder, emptyTitle, emptyBody, people }) {
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
          <PeopleGrid people={filtered} columns={4} />
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
