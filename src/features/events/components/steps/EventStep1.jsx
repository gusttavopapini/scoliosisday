// src/features/events/components/steps/EventStep1.jsx
// Passo 1: Identidade — Banners, Headline, Subtítulo, CTA, Link

import { Controller } from 'react-hook-form';
import ImageUploader from '../../../../components/form/ImageUploader.jsx';
import { UPLOAD_PRESETS } from '../../../../services/storageService.js';

// Um banner por breakpoint: o site público escolhe a arte pela largura da tela
// em vez de reescalar uma única imagem. `slug` entra no caminho do Storage e
// `ratio` só orienta o enquadramento do preview — nada é recortado.
const BANNER_FIELDS = [
  { name: 'bannerDesktopUrl', slug: 'banner-desktop', label: 'Banner Desktop', size: '1920×1080px', ratio: '16 / 9' },
  { name: 'bannerTabletUrl',  slug: 'banner-tablet',  label: 'Banner Tablet',  size: '1024×768px',  ratio: '4 / 3' },
  { name: 'bannerMobileUrl',  slug: 'banner-mobile',  label: 'Banner Mobile',  size: '640×960px',   ratio: '2 / 3' },
];

export default function EventStep1({ register, control, errors, eventId }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <h2 className="sd-subtitle">Identidade do Evento</h2>
        <p className="sd-muted">Configure o nome, descrição e call-to-action</p>
      </div>

      {/* Banners por breakpoint (opcionais) */}
      {BANNER_FIELDS.map(({ name, slug, label, size, ratio }) => (
        <div className="sd-field" key={name}>
          <span className="sd-label">
            {label} <span className="sd-muted">({size})</span>
          </span>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <ImageUploader
                value={field.value || ''}
                onChange={(url) => field.onChange(url)}
                path={`events/${eventId}/${slug}`}
                label={label}
                aspectRatio={ratio}
                {...UPLOAD_PRESETS.eventBanner}
              />
            )}
          />
          {errors[name] && <span className="sd-error">{errors[name].message}</span>}
          <span className="sd-note">Tamanho recomendado: {size}.</span>
        </div>
      ))}

      {/* Posição no carrossel da Home (quando este é o evento atual) */}
      <label className="sd-field" style={{ maxWidth: '260px' }}>
        <span className="sd-label">
          Posição no carrossel <span className="sd-muted">(opcional)</span>
        </span>
        <Controller
          name="bannerOrder"
          control={control}
          render={({ field }) => (
            <input
              className="sd-input"
              type="number"
              min={1}
              step={1}
              placeholder="Ex: 1"
              value={field.value ?? ''}
              onChange={(event) => {
                const raw = event.target.value;
                field.onChange(raw === '' ? null : Number(raw));
              }}
            />
          )}
        />
        {errors.bannerOrder && (
          <span className="sd-error">{errors.bannerOrder.message}</span>
        )}
        <span className="sd-note">
          Posição deste banner entre os banners manuais no carrossel da Home,
          quando este evento é o atual. Sem valor, aparece primeiro.
        </span>
      </label>

      {/* Número da edição */}
      <label className="sd-field" style={{ maxWidth: '260px' }}>
        <span className="sd-label">
          Número da Edição <span className="sd-muted">(opcional)</span>
        </span>
        <Controller
          name="editionNumber"
          control={control}
          render={({ field }) => (
            <input
              className="sd-input"
              type="number"
              min={1}
              step={1}
              placeholder="Ex: 1 para 1ª Edição, 2 para 2ª Edição"
              value={field.value ?? ''}
              onChange={(event) => {
                // '' quando o campo é esvaziado — vira null, não NaN, para o
                // schema aceitar e o site público tratar como "sem número".
                const raw = event.target.value;
                field.onChange(raw === '' ? null : Number(raw));
              }}
            />
          )}
        />
        {errors.editionNumber && (
          <span className="sd-error">{errors.editionNumber.message}</span>
        )}
        <span className="sd-note">
          Define a ordem das abas em /edicoes. Sem número, a edição aparece no fim.
        </span>
      </label>

      {/* Headline */}
      <label className="sd-field">
        <span className="sd-label">
          Headline <span style={{ color: 'var(--danger)' }}>*</span>
        </span>
        <input
          {...register('headline')}
          className="sd-input"
          type="text"
          placeholder="Ex: Conferência de Tecnologia 2026"
          maxLength={120}
        />
        {errors.headline && <span className="sd-error">{errors.headline.message}</span>}
        <span className="sd-note">5 a 120 caracteres</span>
      </label>

      {/* Subtítulo */}
      <label className="sd-field">
        <span className="sd-label">
          Subtítulo <span style={{ color: 'var(--danger)' }}>*</span>
        </span>
        <textarea
          {...register('subtitle')}
          className="sd-textarea"
          placeholder="Descrição breve do evento"
          maxLength={200}
          rows={3}
        />
        {errors.subtitle && <span className="sd-error">{errors.subtitle.message}</span>}
        <span className="sd-note">Até 200 caracteres</span>
      </label>

      {/* CTA */}
      <label className="sd-field">
        <span className="sd-label">
          Call-to-Action <span style={{ color: 'var(--danger)' }}>*</span>
        </span>
        <input
          {...register('cta')}
          className="sd-input"
          type="text"
          placeholder="Ex: Inscrever-se"
          maxLength={40}
        />
        {errors.cta && <span className="sd-error">{errors.cta.message}</span>}
        <span className="sd-note">Até 40 caracteres</span>
      </label>

      {/* Link de inscrição */}
      <label className="sd-field">
        <span className="sd-label">
          Link de Inscrição <span style={{ color: 'var(--danger)' }}>*</span>
        </span>
        <input
          {...register('ctaLink')}
          className="sd-input"
          type="url"
          placeholder="https://exemplo.com/inscreva-se"
        />
        {errors.ctaLink && <span className="sd-error">{errors.ctaLink.message}</span>}
        <span className="sd-note">URL válida que será usada no botão de inscrição</span>
      </label>

      {/* Evento atual */}
      <div className="sd-field">
        <label className="sd-checkbox">
          <input {...register('isCurrent')} type="checkbox" />
          <span className="sd-checkbox__box" aria-hidden="true" />
          <span>Este é o evento atual</span>
        </label>
        <span className="sd-note">
          Apenas um evento pode ser o atual. Ao ativar, o evento anterior será
          desmarcado automaticamente.
        </span>
      </div>
    </div>
  );
}
