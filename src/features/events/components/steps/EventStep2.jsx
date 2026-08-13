// src/features/events/components/steps/EventStep2.jsx
// Passo 2: Modalidade e Valores — Todos os eventos são híbridos, com preços separados

import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import LocationPickerModal from '../../../../components/form/LocationPickerModal.jsx';

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

export default function EventStep2({ control, errors, watch }) {
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

      <PriceField name="priceInPerson" label="Valor Presencial" control={control} errors={errors} watch={watch} />
      <PriceField name="priceOnline" label="Valor Online" control={control} errors={errors} watch={watch} />

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
