// src/features/events/components/steps/EventStep4.jsx
// Passo 4: Pessoas e Programação — Palestrantes, Programação, Patrocinadores

import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Star, X } from 'lucide-react';
import { flattenSessions } from '../../../../utils/programmingDays.js';
import CollaboratorMultiSelect from '../CollaboratorMultiSelect.jsx';

export default function EventStep4({ control, errors, speakers, organizers, curators, programmings, sponsors, watch }) {
  const [speakersSearchTerm, setSpeakersSearchTerm] = useState('');
  const [sponsorsSearchTerm, setSponsorsSearchTerm] = useState('');
  const speakersValue = watch('speakers') || [];
  const starSpeakersValue = watch('starSpeakerIds') || [];
  const sponsorsValue = watch('sponsors') || [];

  const filteredSpeakers = speakers.filter((speaker) =>
    speaker.fullName?.toLowerCase().includes(speakersSearchTerm.toLowerCase())
  );

  const filteredSponsors = sponsors.filter((sponsor) =>
    sponsor.name?.toLowerCase().includes(sponsorsSearchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <h2 className="sd-subtitle">Pessoas e Programação</h2>
        <p className="sd-muted">Adicione palestrantes, programação e patrocinadores</p>
      </div>

      {/* Palestrantes */}
      <div className="sd-field">
        <span className="sd-label">Palestrantes (opcional)</span>
        <Controller
          name="speakers"
          control={control}
          render={({ field: speakersField }) => (
            <Controller
              name="starSpeakerIds"
              control={control}
              render={({ field: starsField }) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {/* Barra de busca */}
                  <input
                    type="text"
                    className="sd-input"
                    placeholder="Buscar palestrante..."
                    value={speakersSearchTerm}
                    onChange={(e) => setSpeakersSearchTerm(e.target.value)}
                  />

                  {/* Lista de palestrantes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {filteredSpeakers.map((speaker) => {
                      const isSelected = speakersValue.includes(speaker.id);
                      const isStarred = starSpeakersValue.includes(speaker.id);

                      return (
                        <div
                          key={speaker.id}
                          onClick={() => {
                            const newValue = isSelected
                              ? speakersValue.filter((id) => id !== speaker.id)
                              : [...speakersValue, speaker.id];
                            speakersField.onChange(newValue);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-3)',
                            border: `2px solid ${isSelected ? 'var(--teal-600)' : 'var(--border-default)'}`,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: isSelected ? 'var(--teal-050)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all var(--dur-fast) var(--ease-out)',
                          }}
                        >
                          {/* Avatar */}
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--surface-brand)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--white)',
                              fontWeight: '600',
                              flexShrink: 0,
                              fontSize: '16px',
                            }}
                          >
                            {speaker.fullName?.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-body)' }}>
                                {speaker.fullName}
                              </h4>
                              {isSelected && (
                                <span style={{ color: 'var(--teal-600)', fontSize: '12px', flexShrink: 0 }}>✓</span>
                              )}
                            </div>
                            {speaker.minibio && (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: '12px',
                                  color: 'var(--text-muted)',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {speaker.minibio}
                              </p>
                            )}
                          </div>

                          {/* Star */}
                          {isSelected && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newStarValue = isStarred
                                  ? starSpeakersValue.filter((id) => id !== speaker.id)
                                  : [...starSpeakersValue, speaker.id];
                                starsField.onChange(newStarValue);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                            >
                              <Star
                                size={20}
                                style={{
                                  color: isStarred ? 'var(--orange-600)' : 'var(--text-muted)',
                                  fill: isStarred ? 'var(--orange-600)' : 'none',
                                  transition: 'all var(--dur-fast) var(--ease-out)',
                                }}
                              />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Chips dos selecionados */}
                  {speakersValue.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-default)' }}>
                      {speakersValue.map((speakerId) => {
                        const speaker = speakers.find((s) => s.id === speakerId);
                        const isStarred = starSpeakersValue.includes(speakerId);
                        if (!speaker) return null;

                        return (
                          <div
                            key={speakerId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-2)',
                              padding: 'var(--space-2) var(--space-3)',
                              backgroundColor: isStarred ? 'var(--orange-050)' : 'var(--surface-sunken)',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '12px',
                              color: 'var(--text-body)',
                            }}
                          >
                            {isStarred && <Star size={14} style={{ color: 'var(--orange-600)', fill: 'var(--orange-600)' }} />}
                            {speaker.fullName}
                            <button
                              type="button"
                              onClick={() => {
                                const newValue = speakersValue.filter((id) => id !== speakerId);
                                speakersField.onChange(newValue);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            />
          )}
        />
        {errors.speakers && <span className="sd-error">{errors.speakers.message}</span>}
      </div>

      {/* Organizadores */}
      <div className="sd-field">
        <span className="sd-label">Organizadores (opcional)</span>
        <CollaboratorMultiSelect
          fieldName="organizerIds"
          control={control}
          errors={errors}
          collaborators={organizers}
          searchPlaceholder="Buscar organizador..."
          emptyMessage="Nenhum colaborador cadastrado como organizador."
        />
      </div>

      {/* Curadoria Científica */}
      <div className="sd-field">
        <span className="sd-label">Curadoria Científica (opcional)</span>
        <CollaboratorMultiSelect
          fieldName="curatorIds"
          control={control}
          errors={errors}
          collaborators={curators}
          searchPlaceholder="Buscar curador..."
          emptyMessage="Nenhum colaborador cadastrado como curador científico."
        />
      </div>

      {/* Programação */}
      <label className="sd-field">
        <span className="sd-label">Programação (opcional)</span>
        <span className="sd-select-wrap">
          <Controller
            name="programming"
            control={control}
            render={({ field }) => (
              <select {...field} className="sd-select" style={{ color: 'var(--text-body)' }}>
                <option value="">Nenhuma</option>
                {programmings.map((prog) => {
                  const sessionCount = flattenSessions(prog).length;
                  return (
                    <option key={prog.id} value={prog.id}>
                      {prog.name} ({sessionCount} sessão{sessionCount !== 1 ? 's' : ''})
                    </option>
                  );
                })}
              </select>
            )}
          />
        </span>
        {errors.programming && <span className="sd-error">{errors.programming.message}</span>}
        <span className="sd-note">Um evento pode ter apenas uma programação vinculada</span>
      </label>

      {/* Patrocinadores */}
      <div className="sd-field">
        <span className="sd-label">Patrocinadores (opcional)</span>
        <Controller
          name="sponsors"
          control={control}
          render={({ field: sponsorsField }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Barra de busca */}
              <input
                type="text"
                className="sd-input"
                placeholder="Buscar patrocinador..."
                value={sponsorsSearchTerm}
                onChange={(e) => setSponsorsSearchTerm(e.target.value)}
              />

              {/* Lista de patrocinadores */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {filteredSponsors.map((sponsor) => {
                  const isSelected = sponsorsValue.includes(sponsor.id);

                  return (
                    <div
                      key={sponsor.id}
                      onClick={() => {
                        const newValue = isSelected
                          ? sponsorsValue.filter((id) => id !== sponsor.id)
                          : [...sponsorsValue, sponsor.id];
                        sponsorsField.onChange(newValue);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        border: `2px solid ${isSelected ? 'var(--teal-600)' : 'var(--border-default)'}`,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'var(--teal-050)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all var(--dur-fast) var(--ease-out)',
                      }}
                    >
                      {/* Logo ou placeholder */}
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--surface-brand)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--white)',
                          fontWeight: '600',
                          flexShrink: 0,
                          fontSize: '14px',
                        }}
                      >
                        {sponsor.name?.charAt(0).toUpperCase()}
                      </div>

                      {/* Nome */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-body)' }}>
                          {sponsor.name}
                        </h4>
                      </div>

                      {/* Checkmark */}
                      {isSelected && (
                        <span style={{ color: 'var(--teal-600)', fontSize: '12px', flexShrink: 0 }}>✓</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Chips dos selecionados */}
              {sponsorsValue.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-default)' }}>
                  {sponsorsValue.map((sponsorId) => {
                    const sponsor = sponsors.find((s) => s.id === sponsorId);
                    if (!sponsor) return null;

                    return (
                      <div
                        key={sponsorId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          padding: 'var(--space-2) var(--space-3)',
                          backgroundColor: 'var(--surface-sunken)',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '12px',
                          color: 'var(--text-body)',
                        }}
                      >
                        {sponsor.name}
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = sponsorsValue.filter((id) => id !== sponsorId);
                            sponsorsField.onChange(newValue);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        />
        {errors.sponsors && <span className="sd-error">{errors.sponsors.message}</span>}
      </div>

      {/* Info */}
      <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--teal-050)', borderRadius: 'var(--radius-md)' }}>
        <p className="sd-small" style={{ color: 'var(--teal-600)' }}>
          👥 Todos os campos deste passo são opcionais. Clique em um palestrante ou patrocinador para selecioná-lo. Clique novamente para desselecionar.
        </p>
      </div>
    </div>
  );
}
