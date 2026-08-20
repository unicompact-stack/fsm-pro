/**
 * auth.ts — централизованная логика входа в FSM PRO.
 *
 * Единственное место, где заданы коды доступа и правила их разбора.
 * Цель: код работника ведёт ТОЛЬКО в панель работника,
 *       код руководителя — ТОЛЬКО в панель руководителя.
 */

export type AuthMode = 'worker' | 'manager' | 'demo';

/**
 * Коды доступа.
 *  - WORKER_CODE  — открывает только панель работника (мастера).
 *  - MANAGER_CODE — открывает только панель руководителя.
 */
export const WORKER_CODE = '1111';
export const MANAGER_CODE = '9999';

const STORAGE_KEY = 'fsm_auth_mode';

/**
 * Разбирает введённый код и возвращает роль, которой он соответствует.
 * Возвращает null, если код не распознан (ни работник, ни руководитель).
 */
export function resolveAuthCode(rawCode: string): 'worker' | 'manager' | null {
  const code = rawCode.trim();
  if (code === WORKER_CODE) return 'worker';
  if (code === MANAGER_CODE) return 'manager';
  return null;
}

/** Сохраняет выбранный режим в localStorage (переживает перезагрузку). */
export function persistAuthMode(mode: AuthMode | null): void {
  if (mode === null) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, mode);
  }
}

/** Читает сохранённый режим (для восстановления сессии). */
export function readPersistedAuthMode(): AuthMode | null {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'worker' || saved === 'manager' || saved === 'demo' ? saved : null;
}
