import { type FormEvent, useEffect, useState } from 'react';
import { updateUser } from '../../services/userService';
import { ApiError } from '../../services/api';
import type { ApiUser, ApiRole } from '../../types/admin';
import { formatPhone, isValidPhone, isValidEmail } from '../../utils/validation';

interface Props {
  user: ApiUser;
  roles: ApiRole[];
  onClose: () => void;
  onUpdated: () => void;
}

const inputCls =
  'w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors disabled:opacity-50';

const labelCls = 'block text-xs font-bold uppercase tracking-widest text-secondary mb-1.5';

export default function EditUserModal({ user, roles, onClose, onUpdated }: Props) {
  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.firstName ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [dpi, setDpi] = useState(user.dpi ?? '');
  const [roleId, setRoleId] = useState(String(user.roleId));
  const [isActive, setIsActive] = useState(user.isActive);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !roleId) return;
    setError(null);

    if (!isValidEmail(email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    if (phone && !isValidPhone(phone)) {
      setError('El teléfono debe tener el formato ####-#### (ej. 5555-1234).');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUser(user.id, {
        email,
        firstName,
        lastName,
        phone,
        dpi,
        roleId: Number(roleId),
        isActive,
      });
      onUpdated();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 400
            ? 'Revisa los campos — el servidor indicó datos inválidos.'
            : err.message
          : 'No se pudo actualizar el usuario. Intenta de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = isSubmitting || !email || !roleId;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-user-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/15">
          <div>
            <h2 id="edit-user-title" className="text-lg font-extrabold text-primary tracking-tight">
              Editar Usuario
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5 font-mono">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-xl" data-icon="close">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-8 py-6 space-y-5">
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
              <span className="material-symbols-outlined text-base mt-px" data-icon="error">error</span>
              {error}
            </div>
          )}

          <div>
            <label className={labelCls} htmlFor="edit-user-email">Correo electrónico</label>
            <input
              id="edit-user-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isSubmitting}
              className={inputCls}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="edit-user-firstName">Nombre</label>
              <input
                id="edit-user-firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Javier"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                disabled={isSubmitting}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="edit-user-lastName">Apellido</label>
              <input
                id="edit-user-lastName"
                type="text"
                autoComplete="family-name"
                placeholder="De León"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                disabled={isSubmitting}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="edit-user-phone">Teléfono</label>
              <input
                id="edit-user-phone"
                type="tel"
                autoComplete="tel"
                placeholder="5555-1234"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                disabled={isSubmitting}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="edit-user-dpi">DPI</label>
              <input
                id="edit-user-dpi"
                type="text"
                autoComplete="off"
                placeholder="9876543210101"
                value={dpi}
                onChange={e => setDpi(e.target.value)}
                disabled={isSubmitting}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="edit-user-role">Rol</label>
            <div className="relative">
              <select
                id="edit-user-role"
                value={roleId}
                onChange={e => setRoleId(e.target.value)}
                disabled={isSubmitting}
                className="appearance-none w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
              >
                {roles.map(r => (
                  <option key={r.id} value={String(r.id)}>{r.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-sm" data-icon="keyboard_arrow_down">
                keyboard_arrow_down
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
            <div>
              <p className="text-sm font-bold text-on-surface">Estado de la cuenta</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {isActive ? 'El usuario puede iniciar sesión' : 'El usuario está desactivado'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(v => !v)}
              disabled={isSubmitting}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                isActive ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-outline-variant text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="flex-1 py-3 rounded-lg bg-[#006655] text-white text-sm font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base" data-icon="progress_activity">progress_activity</span>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
