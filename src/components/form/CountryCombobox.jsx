// src/components/form/CountryCombobox.jsx
// Seletor de país com busca — substitui o <select> nativo que havia no
// formulário de Colaboradores.
//
// Por que não um <select>: a lista sempre teve os ~250 países da ISO, mas
// o <select> nativo só casa digitação pelo COMEÇO do rótulo. "Holanda"
// nunca chegava a "Países Baixos" (o nome oficial em pt), e o país
// parecia não existir. Aqui a busca casa começo, meio, código ISO e
// apelidos — ver SEARCH_ALIASES em utils/countryFlags.js.
//
// Vive em components/form/ (e não dentro de features/collaborators)
// porque hoje há UM formulário com campo de país, e o próximo que
// precisar deve reusar este em vez de nascer como segunda implementação —
// duplicação é o padrão de bug recorrente deste projeto.
//
// Controlado: `value` é o código alpha-2 ('BR') ou '' para "nenhum";
// `onChange` recebe o mesmo. O nome exibido é derivado do código, nunca
// gravado — o Firestore continua guardando só o alpha-2.
//
// Dentro de um <form>: todo botão daqui é type="button" e o Enter é
// SEMPRE interceptado com preventDefault, mesmo com o dropdown fechado.
// Sem isso, Enter na busca submeteria o formulário inteiro — o projeto já
// teve um bug de submit acidental que publicou dado em produção.

import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleFlag } from 'react-circle-flags';
import { ChevronDown, X } from 'lucide-react';
import { filterCountries, countryName } from '../../utils/countryFlags.js';

/**
 * @param {{
 *   value?: string,
 *   onChange: (code: string) => void,
 *   id?: string,
 *   placeholder?: string,
 *   disabled?: boolean,
 * }} props
 */
export default function CountryCombobox({
  value = '',
  onChange,
  id = 'country-combobox',
  placeholder = 'Buscar país…',
  disabled = false,
}) {
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedName = countryName(value);
  // Fechado, a lista volta a ser a completa: reabrir não deve herdar o
  // filtro da busca anterior.
  const options = useMemo(() => filterCountries(isOpen ? query : ''), [isOpen, query]);

  // Fecha ao clicar fora. mousedown (não click) para fechar antes de o
  // alvo processar o próprio clique.
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleOutside(event) {
      if (!wrapperRef.current?.contains(event.target)) close();
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  // Mantém a opção ativa visível ao navegar pelas setas.
  //
  // scrollTop calculado à mão, NUNCA scrollIntoView(): scrollIntoView
  // escolhe sozinho o "ancestral rolável mais próximo" subindo a árvore e
  // pode acabar rolando a página inteira — foi exatamente o bug já
  // corrigido no carrossel (ver PeopleGrid.jsx). Mexer no scrollTop do
  // <ul> afeta só ele.
  useEffect(() => {
    if (!isOpen) return;
    const list = listRef.current;
    const item = list?.children[activeIndex];
    if (!list || !item) return;

    if (item.offsetTop < list.scrollTop) {
      list.scrollTop = item.offsetTop;
    } else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
    }
  }, [activeIndex, isOpen]);

  function open() {
    if (disabled) return;
    setQuery('');
    // Abre já apontando pro país atual, não pro topo da lista.
    const index = options.findIndex((country) => country.code === value);
    setActiveIndex(index >= 0 ? index : 0);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setQuery('');
  }

  function select(code) {
    onChange(code);
    close();
    inputRef.current?.focus();
  }

  function clear(event) {
    event.stopPropagation();
    onChange('');
    close();
  }

  function handleKeyDown(event) {
    // Enter é barrado SEMPRE, aberto ou fechado: com o dropdown fechado
    // ele chegaria ao <form> e submeteria.
    if (event.key === 'Enter') {
      event.preventDefault();
      if (isOpen && options[activeIndex]) select(options[activeIndex].code);
      else if (!isOpen) open();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) return open();
      setActiveIndex((prev) => (prev + 1) % Math.max(options.length, 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) return open();
      setActiveIndex((prev) => (prev - 1 + options.length) % Math.max(options.length, 1));
      return;
    }

    if (event.key === 'Tab' && isOpen) close();
  }

  const activeId = options[activeIndex] ? `${id}-option-${options[activeIndex].code}` : undefined;

  return (
    <div className="sda-combobox" ref={wrapperRef}>
      <div className="sda-combobox__control">
        {/* Bandeira do país já escolhido, à esquerda do campo. */}
        {value && !isOpen && (
          <CircleFlag countryCode={value.toLowerCase()} height={18} width={18} aria-hidden="true" />
        )}

        <input
          ref={inputRef}
          id={id}
          className="sd-input sda-combobox__input"
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-activedescendant={activeId}
          placeholder={value && !isOpen ? '' : placeholder}
          value={isOpen ? query : selectedName}
          disabled={disabled}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onMouseDown={() => !isOpen && open()}
          onKeyDown={handleKeyDown}
        />

        {value && !disabled && (
          <button
            type="button"
            className="sda-combobox__clear"
            onClick={clear}
            aria-label="Limpar país"
            title="Limpar país"
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          className="sda-combobox__toggle"
          onClick={() => (isOpen ? close() : open())}
          aria-label={isOpen ? 'Fechar lista de países' : 'Abrir lista de países'}
          tabIndex={-1}
          disabled={disabled}
        >
          <ChevronDown size={16} aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <ul className="sda-combobox__list" id={`${id}-listbox`} role="listbox" ref={listRef}>
          {options.length === 0 && (
            <li className="sda-combobox__empty" role="presentation">
              Nenhum país encontrado
            </li>
          )}

          {options.map((country, index) => (
            <li
              key={country.code}
              id={`${id}-option-${country.code}`}
              role="option"
              aria-selected={country.code === value}
              className={`sda-combobox__option${index === activeIndex ? ' sda-combobox__option--active' : ''}`}
              // onMouseDown, não onClick: o mousedown do "clicar fora"
              // fecharia a lista antes de o click chegar aqui.
              onMouseDown={(event) => {
                event.preventDefault();
                select(country.code);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <CircleFlag
                countryCode={country.code.toLowerCase()}
                height={20}
                width={20}
                aria-hidden="true"
              />
              <span className="sda-combobox__option-name">{country.name}</span>
              <span className="sda-combobox__option-code">{country.code}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
