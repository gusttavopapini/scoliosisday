// src/features/public/components/editions/ScheduleSession.jsx
// Uma sessão da grade de EditionSchedule.jsx. Componente próprio (em vez de
// inline no .map()) porque useTranslatedContent é um hook — chamar hook
// dentro de .map() violaria as regras de hooks para uma lista de tamanho
// variável.

import { useTranslatedContent } from '../../../../hooks/useTranslatedContent.js';
import AvatarInitials from '../../../../components/ui/AvatarInitials.jsx';

/** "HH:mm" + "HH:mm"|null → "HH:mm–HH:mm" ou só "HH:mm". */
function formatTimeRange(startTime, endTime) {
  return endTime ? `${startTime}–${endTime}` : startTime;
}

/** @param {{ session: object, speakers: object[] }} props */
export default function ScheduleSession({ session, speakers }) {
  // title/theme são texto livre do admin; nome de palestrante é nome
  // próprio e nunca passa pela tradução.
  const { translated, isTranslating } = useTranslatedContent(session, ['title', 'theme']);

  return (
    <div className="sd-session">
      <span className="sd-session__time">
        {formatTimeRange(session.startTime, session.endTime)}
      </span>

      <div className="sd-session__what">
        <span className="sd-session__title">
          <span className={isTranslating ? 'sdp-translating' : undefined}>{translated.title}</span>
        </span>
        {translated.theme && (
          <span className="sdp-session__theme">
            <span className={isTranslating ? 'sdp-translating' : undefined}>{translated.theme}</span>
          </span>
        )}
      </div>

      {speakers.length > 0 && (
        <div className="sdp-session__speakers">
          {speakers.map((speaker) => (
            <span className="sdp-session__speaker" key={speaker.id}>
              <AvatarInitials
                name={speaker.fullName}
                photoUrl={speaker.photoUrl}
                id={speaker.id}
                className="sdp-avatar sdp-avatar--sm"
              />
              <span className="sdp-session__speaker-name">{speaker.fullName}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
