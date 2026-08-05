// src/features/public/components/editions/EditionSchedule.jsx
// Seção 5 de /edicoes: a programação vinculada ao evento, em acordeão por
// dia — cada dia expande/recolhe independente dos demais, pra não deixar a
// grade gigante de vertical quando há muitas sessões.
//
// normalizeDays trata tanto o formato atual (days: [{date,label,sessions}])
// quanto documentos legados (só sessions: [] na raiz) — o mesmo helper que o
// formulário de programação e a integridade referencial já usam.

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useProgramming } from '../../../../hooks/useProgrammings.js';
import { normalizeDays, flattenSessions, formatDayShort } from '../../../../utils/programmingDays.js';
import ScheduleSession from './ScheduleSession.jsx';

/**
 * @param {{ event: object, collaboratorsById: Map<string, object> }} props
 */
export default function EditionSchedule({ event, collaboratorsById }) {
  const { t, lang } = useLanguage();
  const { data: programming } = useProgramming(event.programming || null);
  // O primeiro dia começa expandido (não há hoje um conceito de "dia
  // atual" na programação — só a posição); os demais começam recolhidos.
  // Cada dia é independente: mais de um pode ficar aberto ao mesmo tempo.
  const [openDays, setOpenDays] = useState(() => new Set([0]));

  if (!event.programming || !programming) return null;

  const days = normalizeDays(programming);
  const hasSessions = flattenSessions(programming).length > 0;
  if (!hasSessions) return null;

  function toggleDay(dayIndex) {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayIndex)) next.delete(dayIndex);
      else next.add(dayIndex);
      return next;
    });
  }

  function renderSessions(day) {
    return (
      <div className="sd-schedule sdp-schedule">
        {day.sessions.map((session) => {
          const speakers = (session.speakers ?? [])
            .map((id) => collaboratorsById.get(id))
            .filter(Boolean);

          return <ScheduleSession key={session.id} session={session} speakers={speakers} />;
        })}
      </div>
    );
  }

  return (
    <section className="sd-section sd-section--tight">
      <div className="sd-container">
        <header className="sd-section-header sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal">
            {t.site.scheduleTitle}
          </h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
        </header>

        {days.length > 1 ? (
          <div className="sdp-schedule-days">
            {days.map((day, dayIndex) => {
              const dateLabel = formatDayShort(day.date, lang);
              const isOpen = openDays.has(dayIndex);
              const headerId = `schedule-day-header-${day.id}`;
              const panelId = `schedule-day-panel-${day.id}`;

              return (
                <div key={day.id} className="sdp-schedule-day">
                  <button
                    type="button"
                    id={headerId}
                    className={`sdp-schedule-day__header${isOpen ? ' sdp-schedule-day__header--active' : ''}`}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleDay(dayIndex)}
                  >
                    <span>{dateLabel ? `${day.label} — ${dateLabel}` : day.label}</span>
                    <ChevronDown className="sdp-schedule-day__chevron" size={20} aria-hidden="true" />
                  </button>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={headerId}
                    className={`sdp-schedule-day__panel${isOpen ? ' sdp-schedule-day__panel--open' : ''}`}
                  >
                    <div className="sdp-schedule-day__panel-inner">
                      {renderSessions(day)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          renderSessions(days[0])
        )}
      </div>
    </section>
  );
}
