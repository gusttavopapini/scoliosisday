// src/utils/writeTimeTranslation.js
// Parte 2 do fix de tradução: em vez de chamar a MyMemory a cada visita do
// site público (Parte 1 já corrigiu o sintoma, mas o volume de chamadas é
// a causa raiz do estouro de cota), traduz UMA VEZ ao salvar no painel e
// grava o resultado como campo `_en` no Firestore — o site público passa a
// só LER esse campo, sem chamar a API em tempo de leitura nunca mais.
//
// O diff contra o documento anterior é o que evita re-traduzir a cada
// autosave (EventForm.jsx salva rascunho a cada 30s): só chama a API
// quando o texto de origem realmente mudou desde a última vez que essa
// tradução foi tentada — não a cada save, não a cada tecla.

import { translateTextForStorage } from '../services/translationService.js';

/**
 * Traduz um conjunto de campos de texto simples no nível raiz de um
 * objeto, reaproveitando a tradução anterior quando o texto de origem não
 * mudou. Cada campo `foo` vira `foo_en` no resultado.
 *
 * @param {object} data Dados sendo salvos agora.
 * @param {object|null|undefined} previous Documento anterior (null/undefined
 *   em criação — tudo conta como "mudou").
 * @param {string[]} fields Nomes dos campos a traduzir (sem o sufixo `_en`).
 * @returns {Promise<object>} Objeto parcial com as chaves `${field}_en`.
 */
export async function translateRootFields(data, previous, fields) {
  const result = {};

  await Promise.all(
    fields.map(async (field) => {
      const current = data[field];
      const previousEn = previous?.[`${field}_en`];
      const unchanged = previous && previous[field] === current;

      // Texto de origem igual ao já traduzido: reaproveita, mesmo que a
      // tradução anterior seja null (falha anterior) — só uma mudança de
      // verdade no texto justifica tentar a API de novo.
      if (unchanged && previousEn !== undefined) {
        result[`${field}_en`] = previousEn;
        return;
      }

      result[`${field}_en`] = await translateTextForStorage(current);
    }),
  );

  return result;
}

/**
 * Mesma lógica de translateRootFields, para um array de objetos em
 * POSIÇÃO FIXA (ex: presentation e archiveStats do evento — sempre 3
 * itens, nunca reordenados nem adicionados/removidos livremente) — cada
 * item ganha suas próprias chaves `${field}_en` ao lado dos campos
 * originais. Comparação por índice, não por id (esses arrays não têm id
 * próprio por item).
 *
 * @param {object[]} items
 * @param {object[]|undefined} previousItems
 * @param {string[]} fields
 * @returns {Promise<object[]>}
 */
export async function translateArrayFields(items, previousItems, fields) {
  return Promise.all(
    items.map(async (item, index) => {
      const translations = await translateRootFields(item, previousItems?.[index], fields);
      return { ...item, ...translations };
    }),
  );
}
