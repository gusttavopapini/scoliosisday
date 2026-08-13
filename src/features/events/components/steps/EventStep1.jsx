// src/features/events/components/steps/EventStep1.jsx
// Passo 1: Identidade — Banners, Headline, Subtítulo, CTA, Link

import { Controller } from 'react-hook-form';
import ImageUploader from '../../../../components/form/ImageUploader.jsx';
import ColorPicker from '../../../../components/form/ColorPicker.jsx';
import { UPLOAD_PRESETS } from '../../../../services/storageService.js';
import { CTA_BUTTON_FALLBACK, SEPARATOR_FALLBACK } from '../../constants/defaultPalette.js';

// Um banner por breakpoint: o site público escolhe a arte pela largura da tela
// em vez de reescalar uma única imagem. `slug` entra no caminho do Storage e
// `ratio` só orienta o enquadramento do preview — nada é recortado.
const BANNER_FIELDS = [
  { name: 'bannerDesktopUrl', slug: 'banner-desktop', label: 'Banner Desktop', size: '1920×1080px', ratio: '16 / 9' },
  { name: 'bannerTabletUrl',  slug: 'banner-tablet',  label: 'Banner Tablet',  size: '1024×768px',  ratio: '4 / 3' },
  { name: 'bannerMobileUrl',  slug: 'banner-mobile',  label: 'Banner Mobile',  size: '640×960px',   ratio: '2 / 3' },
];

export default function EventStep1({ register, control, errors, watch, eventId, hideCta = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <h2 className="sd-subtitle">Identidade da Edição</h2>
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

      {/* Posição no carrossel da Home (quando esta é a edição atual) */}
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

      {/* CTA — oculto quando a edição não é a atual: o botão de inscrição não
          é mais exibido publicamente nesse caso (ver EditionHero.jsx). */}
      {!hideCta && (
        <>
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

          {/* Cor do botão CTA */}
          <div className="sd-field">
            <span className="sd-label">
              🎨 Cor do botão <span className="sd-muted">(opcional)</span>
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Controller
                  name="ctaButtonBg"
                  control={control}
                  render={({ field }) => (
                    <ColorPicker
                      value={field.value}
                      onChange={field.onChange}
                      fallback={CTA_BUTTON_FALLBACK.bg}
                      label="Cor de fundo do botão"
                    />
                  )}
                />
                <span className="sd-small">Background</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Controller
                  name="ctaButtonText"
                  control={control}
                  render={({ field }) => (
                    <ColorPicker
                      value={field.value}
                      onChange={field.onChange}
                      fallback={CTA_BUTTON_FALLBACK.text}
                      label="Cor do texto do botão"
                    />
                  )}
                />
                <span className="sd-small">Texto</span>
              </div>
            </div>
            {(errors.ctaButtonBg || errors.ctaButtonText) && (
              <span className="sd-error">
                {errors.ctaButtonBg?.message || errors.ctaButtonText?.message}
              </span>
            )}
            <span className="sd-note">Sem cor definida, o botão usa o laranja padrão do site.</span>
          </div>
        </>
      )}

      {hideCta && (
        <p className="sd-note">
          Como esta não é a edição atual, o botão de inscrição não é exibido no banner público.
        </p>
      )}

      {/* Cor do separador — ao contrário do botão, editável nos dois modos:
          o separador aparece no banner mesmo em edições passadas. */}
      <div className="sd-field">
        <span className="sd-label">
          🎨 Cor do separador <span className="sd-muted">(opcional)</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Controller
            name="separatorColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                value={field.value}
                onChange={field.onChange}
                fallback={SEPARATOR_FALLBACK}
                label="Cor do separador"
              />
            )}
          />
          <span className="sd-small">Separador</span>
        </div>
        {errors.separatorColor && (
          <span className="sd-error">{errors.separatorColor.message}</span>
        )}
        <span className="sd-note">Sem cor definida, o separador usa o laranja padrão do site.</span>
      </div>

      {/* Prévia — só os elementos editáveis (separador + botão, quando
          houver), em fundo escuro igual ao hero público real (ver
          .sda-colorpreview em admin.css). Sem cor definida, usa os mesmos
          fallbacks do site, nunca um elemento sem cor. */}
      <div className="sd-field">
        <span className="sd-label">Prévia</span>
        <div className="sda-colorpreview">
          <div
            className="sd-rule"
            aria-hidden="true"
            style={{ '--rule-color': watch('separatorColor') || undefined }}
          >
            <i /><i /><i /><i /><i />
          </div>
          {!hideCta && (
            <span
              className="sd-btn sd-btn--primary"
              style={{
                backgroundColor: watch('ctaButtonBg') || CTA_BUTTON_FALLBACK.bg,
                borderColor: watch('ctaButtonBg') || CTA_BUTTON_FALLBACK.bg,
                color: watch('ctaButtonText') || CTA_BUTTON_FALLBACK.text,
              }}
            >
              {watch('cta')?.trim() || 'Call-to-Action'}
            </span>
          )}
        </div>
      </div>

      {/* Edição atual */}
      <div className="sd-field">
        <label className="sd-checkbox">
          <input {...register('isCurrent')} type="checkbox" />
          <span className="sd-checkbox__box" aria-hidden="true" />
          <span>Esta é a edição atual</span>
        </label>
        <span className="sd-note">
          Apenas uma edição pode ser a atual. Ao ativar, a edição anterior será
          desmarcada automaticamente.
        </span>
      </div>
    </div>
  );
}
