// src/features/events/components/CollaboratorMultiSelect.jsx
// Wrapper de CollaboratorCardSelect para campos de nível superior do React
// Hook Form (organizerIds/curatorIds do evento). A UI em si — busca, cards,
// chips — vive em components/form/CollaboratorCardSelect.jsx, reaproveitada
// também pelo seletor de palestrantes de cada sessão de programação.

import { Controller } from 'react-hook-form';
import CollaboratorCardSelect from '../../../components/form/CollaboratorCardSelect.jsx';

/**
 * @param {{
 *   fieldName: string,
 *   control: import('react-hook-form').Control,
 *   errors: object,
 *   collaborators: object[],
 *   searchPlaceholder: string,
 *   emptyMessage: string,
 * }} props
 */
export default function CollaboratorMultiSelect({
  fieldName,
  control,
  errors,
  collaborators,
  searchPlaceholder,
  emptyMessage,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => (
          <CollaboratorCardSelect
            value={field.value || []}
            onChange={field.onChange}
            collaborators={collaborators}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
          />
        )}
      />
      {errors[fieldName] && <span className="sd-error">{errors[fieldName].message}</span>}
    </div>
  );
}
