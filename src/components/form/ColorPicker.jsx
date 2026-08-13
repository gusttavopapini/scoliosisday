// src/components/form/ColorPicker.jsx
// Seletor de cor compacto: um círculo com a cor atual (ou o fallback do
// design system) como acionador. Clicar abre um popover inline (editor
// cromático da react-colorful — área de saturação/brilho + slider de matiz)
// e um campo de texto pra digitar o hex direto, sincronizados entre si.
// Sem seletor nativo do SO.
//
// Controlado como o resto dos campos do projeto: quem chama passa
// value/onChange. value null/vazio = "sem cor customizada": o círculo
// mostra o fallback só como PREVIEW, nunca grava o fallback como valor real
// (onChange só dispara numa escolha explícita do usuário).

import { useCallback, useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// Exclusividade entre instâncias: abrir um popover fecha qualquer outro já
// aberto na página (Cor do botão, Cor do separador, etc.), sem acoplar os
// componentes entre si — só o módulo guarda quem está aberto agora.
let activeCloseFn = null;

function openExclusive(closeFn) {
  if (activeCloseFn && activeCloseFn !== closeFn) activeCloseFn();
  activeCloseFn = closeFn;
}

function releaseExclusive(closeFn) {
  if (activeCloseFn === closeFn) activeCloseFn = null;
}

/**
 * @param {{
 *   value: string | null | undefined,
 *   onChange: (hex: string) => void,
 *   fallback: string,
 *   label: string,
 * }} props
 */
export default function ColorPicker({ value, onChange, fallback, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value || fallback);
  const containerRef = useRef(null);

  // O valor de fora manda: reabrir o popover mais tarde (ou o form inteiro
  // recarregando initialData) sempre reflete o que está de fato salvo.
  useEffect(() => {
    setHexInput(value || fallback);
  }, [value, fallback]);

  const closeSelf = useCallback(() => setIsOpen(false), []);

  // Um único useEffect cobre os dois lados da exclusividade: abrir registra
  // esta instância como a ativa (fechando a anterior, se houver); fechar por
  // qualquer caminho (clique fora, Escape, ou o closeFn vindo de outra
  // instância) libera o registro na limpeza.
  useEffect(() => {
    if (!isOpen) return undefined;
    openExclusive(closeSelf);

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      releaseExclusive(closeSelf);
    };
  }, [isOpen, closeSelf]);

  function commitHex(raw) {
    const hex = raw.startsWith('#') ? raw : `#${raw}`;
    setHexInput(hex);
    if (HEX_RE.test(hex)) onChange(hex);
  }

  return (
    <div className="sda-colorpicker" ref={containerRef}>
      <button
        type="button"
        className="sda-colorpicker__swatch"
        style={{ backgroundColor: value || fallback }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={label}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title={label}
      />

      {isOpen && (
        <div className="sda-colorpicker__popover" role="dialog" aria-label={label}>
          <HexColorPicker
            className="sda-colorpicker__wheel"
            color={HEX_RE.test(hexInput) ? hexInput : fallback}
            onChange={commitHex}
          />
          <input
            type="text"
            className="sd-input sda-colorpicker__hex"
            value={hexInput}
            onChange={(event) => commitHex(event.target.value)}
            onBlur={() => {
              // Hex inválido ao sair do campo: volta a refletir o valor
              // real salvo, em vez de deixar texto quebrado no input.
              if (!HEX_RE.test(hexInput)) setHexInput(value || fallback);
            }}
            placeholder="#RRGGBB"
            maxLength={7}
            aria-label={`${label} — código hex`}
          />
        </div>
      )}
    </div>
  );
}
