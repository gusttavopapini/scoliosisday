// src/features/programmings/components/ProgrammingsEmpty.jsx
// Estado vazio para programações.

import { Plus, FileText } from 'lucide-react';

export default function ProgrammingsEmpty({ onCreate }) {
  return (
    <div className="sda-empty">
      <span className="sd-icon-badge sd-icon-badge--lg sd-icon-badge--teal-soft">
        <FileText size={28} aria-hidden="true" />
      </span>
      <h2 className="sd-display sd-display--sm sd-display--upright">
        Nenhuma programação
      </h2>
      <p className="sd-muted">Comece criando sua primeira programação de sessões.</p>
      <button className="sd-btn sd-btn--primary" type="button" onClick={onCreate}>
        <Plus size={16} aria-hidden="true" /> Criar programação
      </button>
    </div>
  );
}
