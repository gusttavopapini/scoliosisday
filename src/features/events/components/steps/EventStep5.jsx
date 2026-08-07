// src/features/events/components/steps/EventStep5.jsx
// Passo 5: Conteúdo Visual — Depoimentos, Galeria/Arquivo da edição, Cores
//
// "Página de arquivo" (archiveTitle/archiveSubtitle/gallery/archiveStats):
// conteúdo da edição só exibido em /edicoes quando o evento NÃO é o atual
// (ver EditionArchive.jsx) — mas preenchível aqui independente de
// isCurrent, pra dar tempo do staff montar o arquivo antes da edição virar
// passado.

import { useFieldArray } from 'react-hook-form';
import GalleryUploader from '../GalleryUploader.jsx';

const COLOR_LABELS = [
  { key: 'background', label: 'Background', cssVar: '--ev-bg' },
  { key: 'text', label: 'Textos', cssVar: '--ev-text' },
  { key: 'button', label: 'Botões', cssVar: '--ev-button' },
  { key: 'detail', label: 'Detalhes', cssVar: '--ev-detail' },
  { key: 'highlight', label: 'Destaques', cssVar: '--ev-highlight' },
];

export default function EventStep5({ register, errors, watch, control, eventId }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'testimonials',
  });

  const colors = watch('colors') || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <h2 className="sd-subtitle">Conteúdo Visual e Prova Social</h2>
        <p className="sd-muted">Depoimentos, vídeos, página de arquivo e paleta de cores</p>
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

      {/* ── Vídeos (placeholder) ── */}
      <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--gray-050)', borderRadius: 'var(--radius-md)' }}>
        <p className="sd-small" style={{ color: 'var(--text-muted)' }}>
          📹 Vídeos (MP4) — Storage pendente nesta versão
        </p>
      </div>

      {/* ── Página de arquivo (exibida em /edicoes quando não é a edição atual) ── */}
      <div>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h3 className="sd-subtitle" style={{ fontSize: 'var(--text-lg)' }}>Página de arquivo</h3>
          <p className="sd-muted sd-small">
            Exibida em Edições só quando esta NÃO é a edição atual. Pode ser preenchida a
            qualquer momento — inclusive antes da edição terminar.
          </p>
        </div>

        <label className="sd-field">
          <span className="sd-label">Título do arquivo</span>
          <input
            {...register('archiveTitle')}
            className="sd-input"
            type="text"
            placeholder="Ex: Como foi a 2ª edição do Scoliosis Day"
            maxLength={120}
          />
          {errors.archiveTitle && <span className="sd-error">{errors.archiveTitle.message}</span>}
        </label>

        <label className="sd-field">
          <span className="sd-label">Subtítulo do arquivo</span>
          <textarea
            {...register('archiveSubtitle')}
            className="sd-textarea"
            placeholder="Descrição breve do que essa edição foi"
            maxLength={200}
            rows={2}
          />
          {errors.archiveSubtitle && <span className="sd-error">{errors.archiveSubtitle.message}</span>}
        </label>

        <GalleryUploader control={control} watch={watch} eventId={eventId} errors={errors} />

        <div style={{ marginTop: 'var(--space-5)' }}>
          <span className="sd-label">Estatísticas (opcional)</span>
          <p className="sd-note" style={{ marginBottom: 'var(--space-3)' }}>
            Até 3 números em destaque (ex: "+3000" participantes). Deixe um bloco em branco
            para não exibi-lo.
          </p>

          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            {[0, 1, 2].map((index) => (
              <div key={index} className="sd-card" style={{ padding: 'var(--space-4)' }}>
                <h4 className="sd-subtitle" style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-3)' }}>
                  Bloco {index + 1}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                  <label className="sd-field">
                    <span className="sd-label">Prefixo</span>
                    <input
                      {...register(`archiveStats.${index}.prefix`)}
                      className="sd-input"
                      type="text"
                      placeholder="Ex: +"
                      maxLength={10}
                    />
                  </label>

                  <label className="sd-field">
                    <span className="sd-label">Valor</span>
                    <input
                      {...register(`archiveStats.${index}.value`)}
                      className="sd-input"
                      type="text"
                      placeholder="Ex: 3000"
                      maxLength={20}
                    />
                  </label>

                  <label className="sd-field">
                    <span className="sd-label">Sufixo</span>
                    <input
                      {...register(`archiveStats.${index}.suffix`)}
                      className="sd-input"
                      type="text"
                      placeholder="Ex: %"
                      maxLength={10}
                    />
                  </label>
                </div>

                <label className="sd-field">
                  <span className="sd-label">Título</span>
                  <input
                    {...register(`archiveStats.${index}.title`)}
                    className="sd-input"
                    type="text"
                    placeholder="Ex: Participantes"
                    maxLength={60}
                  />
                </label>

                <label className="sd-field">
                  <span className="sd-label">Texto</span>
                  <textarea
                    {...register(`archiveStats.${index}.description`)}
                    className="sd-textarea"
                    placeholder="Breve descrição do número acima"
                    maxLength={200}
                    rows={2}
                  />
                </label>
              </div>
            ))}
          </div>
          {errors.archiveStats?.message && (
            <span className="sd-error">{errors.archiveStats.message}</span>
          )}
        </div>
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
