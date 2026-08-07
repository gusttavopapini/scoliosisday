// src/features/sponsors/components/SponsorsEmpty.jsx
// Estado vazio para patrocinadores.

import { Plus, Building2 } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';

export default function SponsorsEmpty({ onCreate }) {
  return (
    <div className="sda-empty">
      <span className="sd-icon-badge sd-icon-badge--lg sd-icon-badge--teal-soft">
        <Building2 size={28} aria-hidden="true" />
      </span>
      <h2 className="sd-display sd-display--sm sd-display--upright">
        Nenhuma marca
      </h2>
      <p className="sd-muted">Comece adicionando sua primeira marca ao evento.</p>
      <button className="sd-btn sd-btn--primary" type="button" onClick={onCreate}>
        <Plus size={16} aria-hidden="true" /> {t.common.create}
      </button>
    </div>
  );
}
