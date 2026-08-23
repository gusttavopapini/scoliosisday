// src/features/events/components/steps/EventStep2.jsx
// Passo 2: Modalidade e Valores — todos os eventos são híbridos, com preços
// separados. Além do VALOR de cada modalidade, este passo personaliza os
// dois cards que a página pública renderiza (EditionPricing.jsx): rótulo e
// cor da tag, subtítulo e rótulo do botão.
//
// Os quatro campos de personalização são opcionais e INDEPENDENTES entre
// si — cada um vazio cai no seu próprio padrão, sem afetar os outros. Por
// isso os placeholders abaixo mostram exatamente o texto que o site usa
// quando o campo fica em branco: o admin vê o que vai aparecer sem ter que
// abrir a página. Eles vêm do mesmo dicionário que o site lê (i18n/pt-BR),
// não de literais copiados — assim não há como divergir.
//
// O que este passo NÃO faz: o LINK do botão continua vindo de `ctaLink`
// (Passo 1), compartilhado pelos dois cards. Só o texto é editável aqui.

import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import LocationPickerModal from '../../../../components/form/LocationPickerModal.jsx';
import ColorPicker from '../../../../components/form/ColorPicker.jsx';
import { PRICING_TAG_FALLBACK_COLORS } from '../../../../utils/pricingCards.js';
import t from '../../../../i18n/pt-BR.js';

function formatCurrency(value) {
  if (!value) return '';
  const num = Number(value);
  if (isNaN(num)) return '';
  return (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function PriceField({ name, label, control, errors, watch }) {
  const value = watch(name);

  return (
    <label className="sd-field">
      <span className="sd-label">
        {label} <span style={{ color: 'var(--danger)' }}>*</span>
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          border: '2px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          paddingLeft: 'var(--space-3)',
          paddingRight: 'var(--space-3)',
          transition: 'border-color var(--dur-fast) var(--ease-out)',
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--teal-600)'}
        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
      >
        <span
          style={{
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--fw-medium)',
            whiteSpace: 'nowrap',
          }}
        >
          R$
        </span>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              value={formatCurrency(value) || ''}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '');
                field.onChange(cleaned ? parseInt(cleaned, 10) : null);
              }}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-text)',
                color: 'var(--text-body)',
                padding: 'var(--space-2) 0',
                textAlign: 'right',
              }}
              type="text"
              placeholder="0,00"
              inputMode="decimal"
            />
          )}
        />
      </div>
      {errors[name] && <span className="sd-error">{errors[name].message}</span>}
      <span className="sd-note">Valor em reais, gravado em centavos</span>
    </label>
  );
}

/**
 * Os quatro campos de personalização de UM card de modalidade.
 *
 * `name` é o prefixo do objeto no formulário (`inPersonCard` ou
 * `onlineCard`) — react-hook-form aceita o caminho com ponto, então os
 * campos são registrados como `inPersonCard.tagLabel` e assim por diante,
 * e chegam ao submit já aninhados na forma que o Firestore recebe.
 *
 * Nenhum controle aqui é `type="submit"`: os inputs não submetem sozinhos
 * (o Enter já é neutralizado em EventForm.jsx) e o único botão da árvore é
 * o gatilho do ColorPicker, que declara `type="button"` internamente.
 */
function ModalityCardFields({ name, register, control, errors, defaults, fallbackColor }) {
  const cardErrors = errors[name] ?? {};

  return (
    <div className="sda-modality-card__fields">
      <label className="sd-field">
        <span className="sd-label">
          Texto da tag <span className="sd-muted">(opcional)</span>
        </span>
        <input
          type="text"
          className="sd-input"
          placeholder={defaults.tagLabel}
          maxLength={30}
          {...register(`${name}.tagLabel`)}
        />
        {cardErrors.tagLabel && <span className="sd-error">{cardErrors.tagLabel.message}</span>}
      </label>

      <div className="sd-field">
        <span className="sd-label">
          Cor da tag <span className="sd-muted">(opcional)</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Controller
            name={`${name}.tagColor`}
            control={control}
            render={({ field }) => (
              <ColorPicker
                value={field.value}
                onChange={field.onChange}
                fallback={fallbackColor}
                label="Cor de fundo da tag"
              />
            )}
          />
          <span className="sd-small">Fundo da tag</span>
        </div>
        {cardErrors.tagColor && <span className="sd-error">{cardErrors.tagColor.message}</span>}
        <span className="sd-note">
          Sem cor definida, a tag usa a cor padrão desta modalidade.
        </span>
      </div>

      <label className="sd-field">
        <span className="sd-label">
          Subtítulo <span className="sd-muted">(opcional)</span>
        </span>
        <textarea
          className="sd-textarea"
          rows={3}
          placeholder={defaults.subtitle}
          maxLength={300}
          {...register(`${name}.subtitle`)}
        />
        {cardErrors.subtitle && <span className="sd-error">{cardErrors.subtitle.message}</span>}
        <span className="sd-note">Texto descritivo exibido abaixo do valor.</span>
      </label>

      <label className="sd-field">
        <span className="sd-label">
          Texto do botão <span className="sd-muted">(opcional)</span>
        </span>
        <input
          type="text"
          className="sd-input"
          placeholder={defaults.ctaLabel}
          maxLength={40}
          {...register(`${name}.ctaLabel`)}
        />
        {cardErrors.ctaLabel && <span className="sd-error">{cardErrors.ctaLabel.message}</span>}
        <span className="sd-note">
          Só o texto. O link continua sendo o do Passo 1, igual para as duas modalidades.
        </span>
      </label>
    </div>
  );
}

export default function EventStep2({ register, control, errors, watch }) {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <h2 className="sd-subtitle">Modalidade e Valores</h2>
        <p className="sd-muted">Todos os eventos do Scoliosis Day são híbridos (presencial + online). Configure os valores de ingresso para cada modalidade.</p>
      </div>

      {/* Info sobre evento híbrido */}
      <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--teal-050)', borderRadius: 'var(--radius-md)' }}>
        <p className="sd-small" style={{ color: 'var(--teal-600)' }}>
          🎯 Este evento será oferecido em ambas as modalidades: presencial e online.
        </p>
      </div>

      {/* Um agrupamento por modalidade: o valor (obrigatório) e a
          personalização opcional do card correspondente, juntos, para o
          admin ver de uma vez tudo que compõe aquele card na página. */}
      <fieldset className="sda-modality-card">
        <legend className="sd-subtitle">Presencial</legend>
        <PriceField name="priceInPerson" label="Valor Presencial" control={control} errors={errors} watch={watch} />
        <ModalityCardFields
          name="inPersonCard"
          register={register}
          control={control}
          errors={errors}
          defaults={{
            tagLabel: t.site.pricingInPersonBadge,
            subtitle: t.site.pricingInPersonText,
            ctaLabel: t.site.cta,
          }}
          fallbackColor={PRICING_TAG_FALLBACK_COLORS.inPerson}
        />
      </fieldset>

      <fieldset className="sda-modality-card">
        <legend className="sd-subtitle">Online</legend>
        <PriceField name="priceOnline" label="Valor Online" control={control} errors={errors} watch={watch} />
        <ModalityCardFields
          name="onlineCard"
          register={register}
          control={control}
          errors={errors}
          defaults={{
            tagLabel: t.site.pricingOnlineBadge,
            subtitle: t.site.pricingOnlineText,
            ctaLabel: t.site.cta,
          }}
          fallbackColor={PRICING_TAG_FALLBACK_COLORS.online}
        />
      </fieldset>

      {/* Local do evento — exibido no fim da página pública da edição (ver
          EditionLocation.jsx). Sem local definido, a seção nem aparece lá. */}
      <div className="sd-field">
        <span className="sd-label">
          📍 Local do evento <span className="sd-muted">(opcional)</span>
        </span>
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <>
              {field.value ? (
                <div className="sda-locationfield">
                  <span className="sda-locationfield__address">
                    <MapPin size={16} aria-hidden="true" />
                    {field.value.address}
                  </span>
                  <button
                    type="button"
                    className="sd-btn sd-btn--outline sd-btn--sm"
                    onClick={() => setIsLocationModalOpen(true)}
                  >
                    Alterar localização
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="sd-btn sd-btn--outline sd-btn--sm"
                  onClick={() => setIsLocationModalOpen(true)}
                >
                  <MapPin size={16} aria-hidden="true" />
                  Selecionar localização no mapa
                </button>
              )}

              {isLocationModalOpen && (
                <LocationPickerModal
                  initialLocation={field.value}
                  onConfirm={field.onChange}
                  onClose={() => setIsLocationModalOpen(false)}
                />
              )}
            </>
          )}
        />
        {errors.location && (
          <span className="sd-error">
            {errors.location.message || errors.location.address?.message}
          </span>
        )}
        <span className="sd-note">
          Exibido ao final da página pública desta edição, com link para o Google Maps.
        </span>
      </div>
    </div>
  );
}
