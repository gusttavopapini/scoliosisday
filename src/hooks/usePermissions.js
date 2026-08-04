// src/hooks/usePermissions.js
// Hook que expõe can(module, action) baseado na role do usuário.
// A UI esconde o que o usuário não pode fazer; as Security Rules bloqueiam de verdade.

import { useMemo } from 'react';
import { useAuth } from './useAuth.js';
import { PERMISSIONS } from '../utils/constants.js';

/**
 * @returns {{ can: (module: string, action: string) => boolean, role: string | null }}
 */
export function usePermissions() {
  const { userData } = useAuth();

  const role = userData?.role ?? null;

  const can = useMemo(() => {
    const rolePermissions = role ? PERMISSIONS[role] : null;

    return (module, action) => {
      if (!rolePermissions) return false;
      const modulePerms = rolePermissions[module];
      if (!modulePerms) return false;
      return modulePerms.includes(action);
    };
  }, [role]);

  return { can, role };
}
