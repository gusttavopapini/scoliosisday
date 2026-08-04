// src/features/programmings/components/ProgrammingForm.jsx
// Formulário para criar/editar programações com múltiplos dias e
// drag-and-drop das sessões dentro de cada dia.

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCreateProgramming, useUpdateProgramming } from '../../../hooks/useProgrammings.js';
import { useCollaborators } from '../../../hooks/useCollaborators.js';
import { useEvents } from '../../../hooks/useEvents.js';
import { programmingSchema } from '../schemas/programmingSchema.js';
import { newDay, newSession, normalizeDays } from '../../../utils/programmingDays.js';
import SessionCard from './SessionCard.jsx';
import DiscardChangesModal from '../../../components/ui/DiscardChangesModal.jsx';
import { useDiscardGuard } from '../../../hooks/useDiscardGuard.js';

const MIN_DAYS = 1;

export default function ProgrammingForm({ initialData, isEditMode = false, onSuccess }) {
  const navigate = useNavigate();

  const [days, setDays] = useState(() => normalizeDays(initialData));

  // Os dias vivem em useState, e o setValue('days') abaixo não usa
  // shouldDirty — de propósito, porque ele roda também na montagem e marcaria
  // o formulário como sujo sem o usuário ter tocado em nada. Então a mudança
  // na árvore de dias/sessões é detectada comparando com este retrato inicial.
  const initialDaysRef = useRef(JSON.stringify(normalizeDays(initialData)));
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // O que aparece no input, como texto. Separado de days.length de propósito:
  // com o input amarrado direto ao array, apagar o conteúdo para redigitar
  // valia 0 -> 1 dia, e os dias já preenchidos eram destruídos no caminho.
  // Aqui o campo pode ficar vazio ou em estado intermediário sem tocar nos
  // dias; só um inteiro >= 1 aplica a mudança.
  const [daysInput, setDaysInput] = useState(String(normalizeDays(initialData).length));

  const createMutation = useCreateProgramming();
  const updateMutation = useUpdateProgramming();
  const { data: allCollaborators = [] } = useCollaborators();
  const speakers = allCollaborators.filter((c) => c.type === 'speaker');
  const { data: events = [], isLoading: isLoadingEvents } = useEvents();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(programmingSchema),
    defaultValues: {
      name: initialData?.name || '',
      eventId: initialData?.eventId || null,
      days,
    },
  });

  // Sincronizar dias com React Hook Form sempre que mudarem
  useEffect(() => {
    setValue('days', days);
  }, [days, setValue]);

  const daysChanged = JSON.stringify(days) !== initialDaysRef.current;

  // Cancelar sai direto quando nada mudou; com alteração, confirma antes.
  const discard = useDiscardGuard({
    isDirty: isDirty || daysChanged,
    onLeave: () => navigate('/painel/programacoes'),
  });

  const activeDay = days[activeDayIndex];

  /** Aplica um updater só ao dia ativo, preservando os demais intactos. */
  function updateActiveDay(updater) {
    setDays((prev) => prev.map((day, i) => (i === activeDayIndex ? updater(day) : day)));
  }

  function handleDaysCountChange(e) {
    const text = e.target.value;
    setDaysInput(text);

    // Vazio ou não numérico: deixa o usuário continuar digitando sem que os
    // dias já montados sejam recortados no meio do caminho.
    if (text.trim() === '') return;
    const raw = Number(text);
    if (!Number.isFinite(raw)) return;

    const count = Math.max(MIN_DAYS, Math.round(raw));

    setDays((prev) => {
      if (count === prev.length) return prev;
      if (count > prev.length) {
        const added = Array.from({ length: count - prev.length }, (_, i) => newDay(prev.length + i));
        return [...prev, ...added];
      }
      return prev.slice(0, count);
    });
    setActiveDayIndex((prev) => Math.min(prev, count - 1));
  }

  /** Ao sair do campo, o texto volta a refletir os dias que existem de fato. */
  function handleDaysCountBlur() {
    setDaysInput(String(days.length));
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    updateActiveDay((day) => {
      const oldIndex = day.sessions.findIndex((s) => s.id === active.id);
      const newIndex = day.sessions.findIndex((s) => s.id === over.id);
      return { ...day, sessions: arrayMove(day.sessions, oldIndex, newIndex) };
    });
  }

  async function onSubmit(data) {
    try {
      const submitData = {
        name: data.name,
        eventId: data.eventId || null,
        days: data.days,
      };

      if (isEditMode && initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          data: submitData,
        });
        toast.success('Programação atualizada com sucesso!');
      } else {
        await createMutation.mutateAsync(submitData);
        toast.success('Programação criada com sucesso!');
      }
      navigate('/painel/programacoes');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar programação:', error);
      toast.error(error.message || 'Erro ao salvar programação');
    }
  }

  const hasEmptySpeakers = days.some((day) => day.sessions.some((s) => s.speakers.length === 0));

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="sd-form--panel" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* ── Nome ── */}
      <label className="sd-field">
        <span className="sd-label">Nome da programação</span>
        <input
          {...register('name')}
          className="sd-input"
          type="text"
          placeholder="Ex: Programação Scoliosis Day 2026"
        />
        {errors.name && (
          <span className="sd-error">{errors.name.message}</span>
        )}
      </label>

      {/* ── Evento (opcional) ── */}
      <label className="sd-field">
        <span className="sd-label">Evento vinculado (opcional)</span>
        <span className="sd-select-wrap">
          <select {...register('eventId')} className="sd-select" disabled={isLoadingEvents}>
            <option value="">Nenhum evento</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.headline}
              </option>
            ))}
          </select>
        </span>
        <span className="sd-note">Opcional. A programação pode existir sem estar ligada a um evento.</span>
      </label>

      {/* ── Quantidade de dias ── */}
      <label className="sd-field" style={{ maxWidth: '220px' }}>
        <span className="sd-label">Quantidade de dias</span>
        <input
          className="sd-input"
          type="number"
          min={MIN_DAYS}
          value={daysInput}
          onChange={handleDaysCountChange}
          onBlur={handleDaysCountBlur}
        />
        <span className="sd-note">Mínimo 1 dia. Cada dia tem sua própria data e lista de sessões.</span>
      </label>

      {/* ── Abas dos dias ── */}
      <div>
        <div className="sd-tabs" role="tablist" aria-label="Dias da programação" style={{ marginBottom: 'var(--space-4)' }}>
          {days.map((day, index) => (
            <button
              key={day.id}
              type="button"
              role="tab"
              id={`day-tab-${day.id}`}
              aria-selected={activeDayIndex === index}
              aria-controls={`day-panel-${day.id}`}
              className={`sd-tabs__tab${activeDayIndex === index ? ' sd-tabs__tab--active' : ''}`}
              onClick={() => setActiveDayIndex(index)}
            >
              {day.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`day-panel-${activeDay.id}`}
          aria-labelledby={`day-tab-${activeDay.id}`}
        >
          {/* ── Data do dia ── */}
          <label className="sd-field" style={{ maxWidth: '220px', marginBottom: 'var(--space-4)' }}>
            <span className="sd-label">Data</span>
            <input
              className="sd-input"
              type="date"
              value={activeDay.date || ''}
              onChange={(e) => updateActiveDay((day) => ({ ...day, date: e.target.value }))}
            />
          </label>

          {/* ── Sessões do dia ── */}
          <h3 style={{ fontWeight: 'var(--fw-semibold)', marginBottom: 'var(--space-4)', color: 'var(--text-heading)' }}>
            Sessões ({activeDay.sessions.length})
          </h3>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeDay.sessions.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                {activeDay.sessions.map((session, index) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    index={index}
                    onUpdate={(updated) => updateActiveDay((day) => ({
                      ...day,
                      sessions: day.sessions.map((s, i) => (i === index ? updated : s)),
                    }))}
                    onDelete={() => updateActiveDay((day) => ({
                      ...day,
                      sessions: day.sessions.length > 1
                        ? day.sessions.filter((_, i) => i !== index)
                        : day.sessions,
                    }))}
                    collaborators={speakers}
                    canDelete={activeDay.sessions.length > 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button
            type="button"
            className="sd-btn sd-btn--secondary"
            onClick={() => updateActiveDay((day) => ({ ...day, sessions: [...day.sessions, newSession()] }))}
          >
            <Plus size={16} aria-hidden="true" />
            Adicionar sessão
          </button>
        </div>
      </div>

      {/* ── Validações de sessões ── */}
      {hasEmptySpeakers && (
        <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--danger)', color: 'white', borderRadius: 'var(--radius-md)' }}>
          ⚠ Todas as sessões precisam de pelo menos 1 palestrante
        </div>
      )}

      {/* ── Botões ── */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          className="sd-btn sd-btn--outline"
          onClick={discard.requestLeave}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="sd-btn sd-btn--primary"
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending || hasEmptySpeakers}
        >
          <Plus size={16} aria-hidden="true" />
          {isEditMode ? 'Atualizar' : 'Criar'} Programação
        </button>
      </div>
    </form>

      {/* ── Descartar alterações ── */}
      {discard.isConfirmOpen && (
        <DiscardChangesModal
          onCancel={discard.cancelLeave}
          onConfirm={discard.confirmLeave}
        />
      )}
    </>
  );
}
