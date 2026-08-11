// src/features/events/components/steps/EventStep5.jsx
// Passo 2 do wizard reduzido (edição passada): Conteúdo de Arquivo — título,
// subtítulo, galeria com destaque e estatísticas exibidos em /edicoes quando
// o evento NÃO é o atual (ver EditionArchive.jsx).
//
// Só existe no fluxo isCurrent: false (ver FULL_STEPS/REDUCED_STEPS em
// EventForm.jsx) — uma edição atual não tem "arquivo" ainda.
//
// Depoimentos e Paleta de Cores saíram deste passo: nenhum dos dois tinha
// leitura pública. Depoimentos era vestígio de antes do módulo dedicado em
// /painel/depoimentos (coleção própria, alimenta os carrosséis da Home) —
// o campo `testimonials` do evento nunca era lido por nenhuma seção
// pública. Paleta só alimentava o preview deste próprio formulário — as
// classes .sda-palette-preview* continuam em admin.css (ainda documentadas
// no catálogo /dev, ver UIDevPage.jsx), só pararam de ter um formulário
// real por trás; o site público sempre usou as cores fixas do design
// system, nunca `event.colors`. Os dois campos continuam no eventSchema só
// por compatibilidade com dado já salvo em edições antigas; pararam de ser
// editáveis por aqui.

import GalleryUploader from '../GalleryUploader.jsx';

export default function EventStep5({ register, errors, watch, control, eventId }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <h2 className="sd-subtitle">Conteúdo de Arquivo</h2>
        <p className="sd-muted">
          Título, subtítulo, galeria de fotos e estatísticas exibidos em /edicoes para esta
          edição passada.
        </p>
      </div>

      {/* ── Vídeos (placeholder) ── */}
      <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--gray-050)', borderRadius: 'var(--radius-md)' }}>
        <p className="sd-small" style={{ color: 'var(--text-muted)' }}>
          📹 Vídeos (MP4) — Storage pendente nesta versão
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
          rows={2}
        />
        {errors.archiveSubtitle && <span className="sd-error">{errors.archiveSubtitle.message}</span>}
      </label>

      <GalleryUploader control={control} watch={watch} eventId={eventId} errors={errors} />

      <div>
        <span className="sd-label">Estatísticas (opcional)</span>
        <p className="sd-note" style={{ marginBottom: 'var(--space-3)' }}>
          Até 3 números em destaque (ex: "3000" participantes). Deixe um bloco em branco
          para não exibi-lo.
        </p>

        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {[0, 1, 2].map((index) => (
            <div key={index} className="sd-card" style={{ padding: 'var(--space-4)' }}>
              <h4 className="sd-subtitle" style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-3)' }}>
                Bloco {index + 1}
              </h4>

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
  );
}
