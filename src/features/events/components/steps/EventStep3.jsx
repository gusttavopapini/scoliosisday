// src/features/events/components/steps/EventStep3.jsx
// Passo 3: Apresentação — os 3 cards com ícone, título e descrição
// (obrigatórios), o título/subtítulo OPCIONAIS da seção que os abriga, e
// abaixo deles o bloco de texto corrido, também opcional.
//
// Os dois são independentes: o bloco de texto em branco não impede
// avançar, e os cards continuam obrigatórios como sempre foram. Só existe
// neste passo do fluxo completo — a edição passada edita o mesmo bloco de
// texto no Passo 2 (ver TextBlockFields.jsx).

import { PRESENTATION_ICONS as AVAILABLE_ICONS } from '../../../../utils/constants.js';
import TextBlockFields from './TextBlockFields.jsx';

export default function EventStep3({ register, errors, watch }) {
  const presentation = watch('presentation') || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <h2 className="sd-subtitle">Apresentação Visual</h2>
        <p className="sd-muted">Crie exatamente 3 cards que descrevem o evento</p>
      </div>

      {/* Cabeçalho da seção de cards no site. Os dois campos são
          OPCIONAIS e independentes dos cards: em branco, a página usa o
          texto institucional padrão — que é o que toda edição já criada
          tem hoje, e por isso preencher não pode virar obrigação. */}
      <div className="sd-card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h3 className="sd-subtitle">
            Título da seção <span className="sd-muted">(opcional)</span>
          </h3>
          <p className="sd-note">
            Aparece acima dos cards na página desta edição. Deixe em branco para usar o texto
            padrão &ldquo;O que é o Scoliosis Day&rdquo;.
          </p>
        </div>

        <label className="sd-field">
          <span className="sd-label">Título</span>
          <input
            {...register('presentationTitle')}
            className="sd-input"
            type="text"
            placeholder="O que é o Scoliosis Day"
            maxLength={120}
          />
          {errors.presentationTitle && (
            <span className="sd-error">{errors.presentationTitle.message}</span>
          )}
          <span className="sd-note">
            Até 120 caracteres. Escrever &ldquo;Scoliosis Day&rdquo; no meio da frase aplica
            automaticamente a tipografia da marca.
          </span>
        </label>

        <label className="sd-field">
          <span className="sd-label">Subtítulo</span>
          <input
            {...register('presentationSubtitle')}
            className="sd-input"
            type="text"
            placeholder="Linha de apoio exibida abaixo do título."
            maxLength={200}
          />
          {errors.presentationSubtitle && (
            <span className="sd-error">{errors.presentationSubtitle.message}</span>
          )}
          <span className="sd-note">Até 200 caracteres.</span>
        </label>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
        {[0, 1, 2].map((index) => (
          <div key={index} className="sd-card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h3 className="sd-subtitle">Card {index + 1}</h3>
            </div>

            {/* Ícone */}
            <label className="sd-field">
              <span className="sd-label">
                Ícone <span style={{ color: 'var(--danger)' }}>*</span>
              </span>
              <span className="sd-select-wrap">
                <select {...register(`presentation.${index}.icon`)} className="sd-select">
                  <option value="">Selecione um ícone...</option>
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </span>
              {errors.presentation?.[index]?.icon && (
                <span className="sd-error">{errors.presentation[index].icon.message}</span>
              )}
            </label>

            {/* Título */}
            <label className="sd-field">
              <span className="sd-label">
                Título <span style={{ color: 'var(--danger)' }}>*</span>
              </span>
              <input
                {...register(`presentation.${index}.title`)}
                className="sd-input"
                type="text"
                placeholder="Ex: Networking"
                maxLength={60}
              />
              {errors.presentation?.[index]?.title && (
                <span className="sd-error">{errors.presentation[index].title.message}</span>
              )}
              <span className="sd-note">Até 60 caracteres</span>
            </label>

            {/* Descrição com contador */}
            <label className="sd-field">
              <span className="sd-label">
                Descrição <span style={{ color: 'var(--danger)' }}>*</span>
              </span>
              <textarea
                {...register(`presentation.${index}.description`)}
                className="sd-textarea"
                placeholder="Descreva este aspecto do evento"
                maxLength={200}
                rows={3}
              />
              {errors.presentation?.[index]?.description && (
                <span className="sd-error">{errors.presentation[index].description.message}</span>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="sd-note">Até 200 caracteres</span>
                <span className="sd-small" style={{ color: 'var(--text-muted)' }}>
                  {(presentation[index]?.description || '').length}/200
                </span>
              </div>
            </label>
          </div>
        ))}
      </div>

      {errors.presentation && typeof errors.presentation === 'object' && !Array.isArray(errors.presentation) && (
        <div style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)' }}>
          {errors.presentation.message}
        </div>
      )}

      <TextBlockFields register={register} errors={errors} />
    </div>
  );
}
