// src/features/public/components/editions/EditionDebugBar.jsx
// Ferramenta temporária de depuração: mostra quais campos do evento ativo
// estão preenchidos, para explicar por que cada seção de /edicoes aparece
// ou some. Só renderiza em localhost — nunca em produção, mesmo que o
// componente continue montado no bundle.
//
// Rótulos em português e fixos (não passam por t.site.*) de propósito: é
// depuração interna sobre nomes de campo do Firestore, não conteúdo da
// interface — traduzir "starSpeakerIds" não ajudaria ninguém a debugar.
// Remover este arquivo e a chamada em EditionsPage.jsx quando não for mais
// necessário.

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1'];

function isLocalhost() {
  return typeof window !== 'undefined' && LOCAL_HOSTNAMES.includes(window.location.hostname);
}

/** @param {{ fields: { label: string, filled: boolean }[] }} props */
export default function EditionDebugBar({ fields }) {
  if (!isLocalhost()) return null;

  return (
    <div className="sdp-debug-bar" role="note">
      <span className="sdp-debug-bar__label">Debug · campos do evento ativo</span>
      {fields.map(({ label, filled }) => (
        <span className="sdp-debug-bar__item" key={label}>
          <span
            className={`sdp-debug-bar__dot ${filled ? 'sdp-debug-bar__dot--on' : 'sdp-debug-bar__dot--off'}`}
            aria-hidden="true"
          />
          {label}
        </span>
      ))}
    </div>
  );
}
