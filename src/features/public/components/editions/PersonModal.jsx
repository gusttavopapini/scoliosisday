// src/features/public/components/editions/PersonModal.jsx
// Modal "Ver mais" do PersonCard — foto, nome, cargo e currículo. Mini bio
// removida (campo saiu do formulário de Colaboradores no painel).
// Reaproveita o primitivo Modal.jsx do painel (foco, Esc, clique fora já
// resolvidos ali) só com conteúdo/visual sdp-* por dentro.
//
// curriculum vem do Firestore como HTML (editor rico do formulário de
// colaboradores no painel) — só admin/staff escreve esse conteúdo, por
// isso dangerouslySetInnerHTML aqui é seguro.
//
// O currículo JÁ PASSA pela tradução. Antes não passava, e o comentário
// aqui registrava o porquê: a API trabalha com texto puro e traduzir a
// string de HTML inteira quebraria as tags. A saída foi traduzir nó a nó
// ao SALVAR (utils/translateForStorage.js), preservando a árvore — o que
// chega aqui é o `curriculum_en` pronto, lido sem nenhuma chamada de API.

import Modal from '../../../../components/ui/Modal.jsx';
import AvatarInitials from '../../../../components/ui/AvatarInitials.jsx';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useStoredTranslation } from '../../../../hooks/useStoredTranslation.js';
import { displayName } from '../../../../utils/honorifics.js';

/**
 * @param {{ person: object, tagLabel?: string, onClose: () => void }} props
 */
export default function PersonModal({ person, tagLabel, onClose }) {
  const { t, lang } = useLanguage();
  // Colaborador antigo (sem `curriculum_en`) cai no currículo em
  // português, exatamente como se comportava antes desta mudança.
  const translated = useStoredTranslation(person, ['curriculum']);

  return (
    <Modal labelledBy="person-modal-title" onClose={onClose}>
      <div className="sda-modal__head">
        <h2 id="person-modal-title">{displayName(person.fullName, lang)}</h2>
        <button
          className="sd-btn sd-btn--ghost sd-btn--sm"
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
        >
          ✕
        </button>
      </div>

      <div className="sda-modal__body sdp-people-modal__body">
        <AvatarInitials
          name={person.fullName}
          photoUrl={person.photoUrl}
          id={person.id}
          className="sdp-people-modal__photo"
        />

        {tagLabel && <p className="sdp-people-modal__role">{tagLabel}</p>}

        {person.curriculum && (
          <div className="sdp-people-modal__curriculum">
            <h3>{t.site.personModalCurriculumTitle}</h3>
            {/* eslint-disable-next-line react/no-danger -- HTML do editor rico do painel, só admin/staff escreve. */}
            <div dangerouslySetInnerHTML={{ __html: translated.curriculum }} />
          </div>
        )}
      </div>
    </Modal>
  );
}
