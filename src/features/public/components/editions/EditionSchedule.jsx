// src/features/public/components/editions/EditionSchedule.jsx
// Seção 5 de /edicoes: a programação vinculada ao evento, em abas por dia.
//
// normalizeDays trata tanto o formato atual (days: [{date,label,sessions}])
// quanto documentos legados (só sessions: [] na raiz) — o mesmo helper que o
// formulário de programação e a integridade referencial já usam.

import { useState } from 'react';
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
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  if (!event.programming || !programming) return null;

  const days = normalizeDays(programming);
  const hasSessions = flattenSessions(programming).length > 0;
  if (!hasSessions) return null;

  const activeDay = days[activeDayIndex] ?? days[0];

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

        {days.length > 1 && (
          <div className="sd-tabs sdp-schedule__tabs" role="tablist" aria-label={t.site.scheduleTitle}>
            {days.map((day, dayIndex) => {
              const dateLabel = formatDayShort(day.date, lang);
              return (
                <button
                  key={day.id}
                  type="button"
                  role="tab"
                  aria-selected={dayIndex === activeDayIndex}
                  className={`sd-tabs__tab${dayIndex === activeDayIndex ? ' sd-tabs__tab--active' : ''}`}
                  onClick={() => setActiveDayIndex(dayIndex)}
                >
                  {dateLabel ? `${day.label} — ${dateLabel}` : day.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="sd-schedule sdp-schedule">
          {activeDay.sessions.map((session) => {
            const speakers = (session.speakers ?? [])
              .map((id) => collaboratorsById.get(id))
              .filter(Boolean);

            return <ScheduleSession key={session.id} session={session} speakers={speakers} />;
          })}
        </div>
      </div>
    </section>
  );
}
