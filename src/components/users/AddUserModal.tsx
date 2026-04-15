import { type FormEvent, useEffect, useState } from 'react';
import { createUser } from '../../services/userService';
import { ApiError } from '../../services/api';
import type { ApiRole } from '../../types/admin';
import { validatePassword } from '../../screens/LoginScreen';
import { formatPhone, isValidPhone, isValidEmail } from '../../utils/validation';

interface Props {
  roles: ApiRole[];
  onClose: () => void;
  onCreated: () => void;
}

const inputCls =
  'w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors disabled:opacity-50';

const labelCls = 'block text-xs font-bold uppercase tracking-widest text-secondary mb-1.5';

export default function AddUserModal({ roles, onClose, onCreated }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dpi, setDpi] = useState('');
  const [roleId, setRoleId] = useState<string>(roles[0] ? String(roles[0].id) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password || !roleId || !firstName || !lastName || !phone || !dpi) return;
    setError(null);

    if (!isValidEmail(email)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    if (!isValidPhone(phone)) {
      setError('El teléfono debe tener el formato ####-#### (ej. 5555-1234).');
      return;
    }

    try {
      validatePassword(password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await createUser({ email, password, roleId: Number(roleId), firstName, lastName, phone, dpi });
      onCreated();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 400
            ? 'Revisa los campos — el servidor indicó datos inválidos.'
            : err.message
          : 'No se pudo crear el usuario. Intenta de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const disabled = isSubmitting || !email || !password || !roleId || !firstName || !lastName || !phone || !dpi;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-user-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/15">
          <div>
            <h2 id="add-user-title" className="text-lg font-extrabold text-primary tracking-tight">
              Agregar Usuario
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Completa los campos para crear una nueva cuenta.
            </p>
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
            <label className={labelCls} htmlFor="new-user-email">Correo electrónico</label>
            <input
              id="new-user-email"
              type="email"
              autoComplete="off"
              placeholder="usuario@ilu.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isSubmitting}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="new-user-password">Contraseña</label>
            <div className="relative">
              <input
                id="new-user-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isSubmitting}
                className={`${inputCls} pr-12`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-lg" data-icon={showPassword ? 'visibility_off' : 'visibility'}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="new-user-firstName">Nombre</label>
              <input
                id="new-user-firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Javier"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                disabled={isSubmitting}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="new-user-lastName">Apellido</label>
              <input
                id="new-user-lastName"
                type="text"
                autoComplete="family-name"
                placeholder="De León"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                disabled={isSubmitting}
                className={inputCls}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="new-user-phone">Teléfono</label>
              <input
                id="new-user-phone"
                type="tel"
                autoComplete="tel"
                placeholder="5555-1234"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                disabled={isSubmitting}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="new-user-dpi">DPI</label>
              <input
                id="new-user-dpi"
                type="text"
                autoComplete="off"
                placeholder="9876543210101"
                value={dpi}
                onChange={e => setDpi(e.target.value)}
                disabled={isSubmitting}
                className={inputCls}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="new-user-role">Rol</label>
            <div className="relative">
              <select
                id="new-user-role"
                value={roleId}
                onChange={e => setRoleId(e.target.value)}
                disabled={isSubmitting}
                className="appearance-none w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                required
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

          {/* Actions */}
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
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
