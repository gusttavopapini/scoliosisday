// src/features/banners/components/BannersEmpty.jsx
// Estado vazio da listagem de banners.

import { Plus, Image } from 'lucide-react';
import t from '../../../i18n/pt-BR.js';

export default function BannersEmpty({ onCreate }) {
  return (
    <div className="sda-empty" role="status" aria-label={t.banners.emptyTitle}>
      <span className="sd-icon-badge sd-icon-badge--lg sd-icon-badge--teal-soft" aria-hidden="true">
        <Image size={28} />
      </span>
      <h2 className="sd-display sd-display--sm sd-display--upright">
        {t.banners.emptyTitle}
      </h2>
      <p className="sd-muted">{t.banners.emptyBody}</p>
      <button className="sd-btn sd-btn--primary" type="button" onClick={onCreate}>
        <Plus size={16} aria-hidden="true" /> {t.banners.create}
      </button>
    </div>
  );
}
