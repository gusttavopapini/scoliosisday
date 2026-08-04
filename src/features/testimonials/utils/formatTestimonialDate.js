// src/features/testimonials/utils/formatTestimonialDate.js
// `date` é gravado como string "YYYY-MM-DD" (valor cru de <input type="date">,
// mesma convenção do campo `date` dos dias de programação). Reformata para
// "DD/MM/AAAA" via split — não usar `new Date(string)`: interpretaria a
// string como meia-noite UTC e exibiria um dia a menos em fusos negativos
// (ex.: Brasil).

export function formatTestimonialDate(value) {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return '—';
  return `${day}/${month}/${year}`;
}
