// src/features/events/components/steps/TextBlockFields.jsx
// Os dois campos do bloco de texto corrido opcional da página da edição
// (textBlock: título + parágrafo), renderizados dentro de um passo que já
// existe — nunca num passo próprio:
//
//   • edição atual  (isCurrent: true)  → Passo 3, abaixo dos 3 cards
//   • edição passada (isCurrent: false) → Passo 2, "Conteúdo de arquivo"
//
// Um componente só, usado pelos dois passos, porque é literalmente o mesmo
// campo do mesmo documento: duas cópias divergiriam na primeira mudança de
// rótulo ou de limite (o projeto já tem histórico disso).
//
// O bloco é all-or-nothing: em branco não aparece no site; começou,
// precisa terminar. A regra vive no eventSchema (superRefine) — aqui só se
// exibem as mensagens que ela produz, no mesmo padrão .sd-error do resto
// do wizard.

/** @param {{ register: Function, errors: object }} props */
export default function TextBlockFields({ register, errors }) {
  const textErrors = errors.textBlock ?? {};

  return (
    <div className="sd-card" style={{ padding: 'var(--space-6)' }}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h3 className="sd-subtitle">
          Bloco de texto <span className="sd-muted">(opcional)</span>
        </h3>
        <p className="sd-note">
          Um título e um parágrafo de texto corrido, exibidos na página desta edição.
          Deixe os dois em branco para não exibir esta seção.
        </p>
      </div>

      <label className="sd-field">
        <span className="sd-label">Título</span>
        <input
          {...register('textBlock.title')}
          className="sd-input"
          type="text"
          placeholder="Ex: O retorno a Recife e um novo patamar para o evento"
          maxLength={120}
        />
        {textErrors.title && <span className="sd-error">{textErrors.title.message}</span>}
        <span className="sd-note">Até 120 caracteres</span>
      </label>

      <label className="sd-field">
        <span className="sd-label">Texto</span>
        <textarea
          {...register('textBlock.body')}
          className="sd-textarea"
          rows={6}
          placeholder="Parágrafo exibido abaixo do título."
        />
        {textErrors.body && <span className="sd-error">{textErrors.body.message}</span>}
      </label>
    </div>
  );
}
