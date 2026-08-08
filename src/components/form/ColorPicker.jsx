// src/components/form/ColorPicker.jsx
// Seletor de cor compacto: um círculo com a cor atual (ou o fallback do
// design system) como acionador. Clicar abre um popover com o input nativo
// type="color" (já traz o círculo cromático do SO no macOS/iOS/Chrome) e um
// campo de texto pra digitar o hex direto, sincronizados entre si.
//
// Sem lib externa — o nativo cobre o caso de uso pedido.
//
// Controlado como o resto dos campos do projeto: quem chama passa
// value/onChange. value null/vazio = "sem cor customizada": o círculo
// mostra o fallback só como PREVIEW, nunca grava o fallback como valor real
// (onChange só dispara numa escolha explícita do usuário).

import { useEffect, useRef, useState } from 'react';

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

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

  useEffect(() => {
    if (!isOpen) return undefined;

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
    };
  }, [isOpen]);

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
          <input
            type="color"
            className="sda-colorpicker__native"
            value={HEX_RE.test(hexInput) ? hexInput : fallback}
            onChange={(event) => commitHex(event.target.value)}
            aria-label={`${label} — seletor do sistema`}
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
