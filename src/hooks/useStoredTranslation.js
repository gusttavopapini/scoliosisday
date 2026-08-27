// src/hooks/useStoredTranslation.js
// Parte 2 do fix de tradução (ver utils/writeTimeTranslation.js): lê
// campos `_en` já traduzidos e gravados no Firestore ao salvar no painel,
// em vez de chamar a MyMemory em tempo de leitura a cada visita — é isso
// que elimina o consumo de cota pra quem só está LENDO o site.
//
// Substitui useTranslatedContent (hooks/useTranslatedContent.js) para
// conteúdo cujo fluxo de escrita já foi migrado: eventos, banners,
// depoimentos (quote/role) e o currículo do colaborador — ver
// services/events.js, banners.js, testimonials.js e collaborators.js.
//
// FALTA MIGRAR: as sessões de programação (ScheduleSession.jsx), o único
// ponto que ainda chama a API ao vivo no pageview. Os dois hooks convivem
// até essa última migração.
//
// Sem chamada assíncrona, sem estado de "traduzindo": o dado já está no
// documento, isso aqui só escolhe qual campo mostrar.

import { useLanguage } from './useLanguage.js';

/**
 * @param {object|null|undefined} content Objeto vindo do Firestore, já com
 *   os campos `${field}_en` gravados (ou null, se a tradução de escrita
 *   falhou/ainda não rodou).
 * @param {string[]} fields Campos a resolver (sem o sufixo `_en`).
 * @returns {object|null|undefined} `content`, com cada campo trocado pelo
 *   seu `_en` quando o idioma é inglês e a tradução existe — cai no valor
 *   original (PT) quando `_en` é null/vazio/undefined ou o idioma é PT.
 */
export function useStoredTranslation(content, fields) {
  const { lang } = useLanguage();

  if (!content || lang !== 'en') return content;

  const resolved = { ...content };
  for (const field of fields) {
    const translatedValue = content[`${field}_en`];
    if (translatedValue) resolved[field] = translatedValue;
  }
  return resolved;
}
