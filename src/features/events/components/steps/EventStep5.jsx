// src/features/events/components/steps/EventStep5.jsx
// Passo 5: Conteúdo Visual — Depoimentos, Vídeos, Galeria, Cores

import { useFieldArray } from 'react-hook-form';

const COLOR_LABELS = [
  { key: 'background', label: 'Background', cssVar: '--ev-bg' },
  { key: 'text', label: 'Textos', cssVar: '--ev-text' },
  { key: 'button', label: 'Botões', cssVar: '--ev-button' },
  { key: 'detail', label: 'Detalhes', cssVar: '--ev-detail' },
  { key: 'highlight', label: 'Destaques', cssVar: '--ev-highlight' },
];

export default function EventStep5({ register, errors, watch, control }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'testimonials',
  });

  const colors = watch('colors') || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <h2 className="sd-subtitle">Conteúdo Visual e Prova Social</h2>
        <p className="sd-muted">Depoimentos, vídeos, galeria e paleta de cores</p>
      </div>

      {/* ── Depoimentos textuais ── */}
      <div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h3 className="sd-subtitle" style={{ fontSize: 'var(--text-lg)' }}>Depoimentos</h3>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="sd-card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <label className="sd-field">
                <span className="sd-label">Nome</span>
                <input
                  {...register(`testimonials.${index}.name`)}
                  className="sd-input"
                  type="text"
                  placeholder="Nome"
                />
              </label>

              <label className="sd-field">
                <span className="sd-label">Sobrenome</span>
                <input
                  {...register(`testimonials.${index}.surname`)}
                  className="sd-input"
                  type="text"
                  placeholder="Sobrenome"
                />
              </label>
            </div>

            <label className="sd-field">
              <span className="sd-label">Ocupação</span>
              <input
                {...register(`testimonials.${index}.occupation`)}
                className="sd-input"
                type="text"
                placeholder="Ex: Desenvolvedor, Designer"
              />
            </label>

            <label className="sd-field">
              <span className="sd-label">Depoimento</span>
              <textarea
                {...register(`testimonials.${index}.text`)}
                className="sd-textarea"
                placeholder="O que achou do evento?"
                rows={3}
              />
            </label>

            <button
              type="button"
              className="sd-btn sd-btn--outline sd-btn--sm"
              onClick={() => remove(index)}
              style={{ marginTop: 'var(--space-2)' }}
            >
              Remover depoimento
            </button>
          </div>
        ))}

        <button
          type="button"
          className="sd-btn sd-btn--secondary"
          onClick={() => append({ text: '', name: '', surname: '', occupation: '' })}
        >
          + Adicionar depoimento
        </button>
      </div>

      {/* ── Vídeos e Galeria (placeholders) ── */}
      <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--gray-050)', borderRadius: 'var(--radius-md)' }}>
        <p className="sd-small" style={{ color: 'var(--text-muted)' }}>
          📹 Vídeos (MP4) e 🖼️ Galeria de fotos (PNG) — Storage pendente nesta versão
        </p>
      </div>

      {/* ── Paleta de cores ── */}
      <div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h3 className="sd-subtitle" style={{ fontSize: 'var(--text-lg)' }}>Paleta de Cores</h3>
          <p className="sd-muted sd-small">Configure as cores principais do evento</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {COLOR_LABELS.map((colorDef) => (
            <label key={colorDef.key} className="sd-field">
              <span className="sd-label">{colorDef.label}</span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  {...register(`colors.${colorDef.key}`)}
                  className="sd-input"
                  type="text"
                  placeholder="Digite uma cor hex"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  style={{ flex: 1 }}
                />
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: colors[colorDef.key] || 'var(--black)',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid var(--border)',
                  }}
                />
              </div>
              {errors.colors?.[colorDef.key] && (
                <span className="sd-error">{errors.colors[colorDef.key].message}</span>
              )}
            </label>
          ))}
        </div>

        {/* Preview isolado das cores */}
        <div
          style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-6)',
            backgroundColor: colors.background || 'var(--white)',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--border)',
          }}
        >
          <h4
            style={{
              color: colors.text || 'var(--black)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--fw-semibold)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Preview de Cores
          </h4>
          <p style={{ color: colors.text || 'var(--black)', marginBottom: 'var(--space-3)' }}>
            Este é um exemplo de como o evento ficará com suas cores
          </p>
          <button
            type="button"
            className="sd-btn sd-btn--primary"
            style={{
              backgroundColor: colors.button || 'var(--teal-600)',
              borderColor: colors.button || 'var(--teal-600)',
              color: colors.highlight ? 'white' : 'white',
            }}
          >
            Inscrever-se
          </button>
          <div
            style={{
              marginTop: 'var(--space-3)',
              padding: 'var(--space-3)',
              backgroundColor: colors.detail || 'var(--teal-600)',
              color: colors.text || 'var(--black)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Detalhe destacado
          </div>
        </div>
      </div>
    </div>
  );
}
