import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';
import { registerUser } from '../services/authService';
import { formatPhone, isValidPhone, isValidEmail } from '../utils/validation';

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'login' | 'register';

// ─── Shared field classes ─────────────────────────────────────────────────────

const inputCls =
  'w-full px-4 py-3 bg-surface-container-lowest border-[0.5px] border-outline-variant/40 rounded-lg focus:outline-none focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline transition-all duration-200 disabled:opacity-50';

const labelCls = 'text-xs font-bold uppercase tracking-widest text-secondary';

const submitBtnCls =
  'w-full py-4 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2';

// ─── Error / Success banners ──────────────────────────────────────────────────

function AlertBanner({ type, message }: { type: 'error' | 'success'; message: string }) {
  const isError = type === 'error';
  return (
    <div
      role="alert"
      className={`mb-6 flex items-start gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
        isError
          ? 'bg-error-container text-on-error-container'
          : 'bg-primary/10 text-primary'
      }`}
    >
      <span className="material-symbols-outlined text-base mt-px" data-icon={isError ? 'error' : 'check_circle'}>
        {isError ? 'error' : 'check_circle'}
      </span>
      <span>{message}</span>
    </div>
  );
}

// ─── Spinner label ────────────────────────────────────────────────────────────

function SpinnerLabel({ label }: { label: string }) {
  return (
    <>
      <span className="material-symbols-outlined animate-spin text-lg" data-icon="progress_activity">
        progress_activity
      </span>
      {label}
    </>
  );
}

// ─── Password Validator ───────────────────────────────────────────────────────

export function validatePassword(password: string): void {
  if (password.length < 8)          throw new Error('La contraseña debe tener al menos 8 caracteres');
  if (!/[A-Z]/.test(password))      throw new Error('La contraseña debe tener al menos una mayúscula');
  if (!/[0-9]/.test(password))      throw new Error('La contraseña debe tener al menos un número');
  if (!/[^A-Za-z0-9]/.test(password)) throw new Error('La contraseña debe tener al menos un carácter especial');
}

// ─── LoginScreen ──────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // ── View toggle ──
  const [mode, setMode] = useState<Mode>('login');

  // ── Shared controlled fields ──
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState(''); // register only
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  // ── Register-only fields ──
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [dpi, setDpi]             = useState('');

  // ── UI state ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState<string | null>(null);

  // ── Reset all fields when switching mode ──
  const switchMode = (next: Mode) => {
    setMode(next);
    setEmail('');
    setPassword('');
    setConfirm('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setDpi('');
    setError(null);
    setSuccess(null);
  };

  // ── Login handler ──
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      let msg = 'No se pudo conectar con el servidor. Revisa tu conexión.';
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          msg = err.message && !err.message.startsWith('HTTP') && err.message.toLowerCase() !== 'unauthorized' 
            ? err.message 
            : 'Correo o contraseña incorrectos.';
        } else {
          msg = err.message && !err.message.startsWith('HTTP') 
            ? err.message 
            : 'Ocurrió un error. Intenta de nuevo.';
        }
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Register handler ──
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

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
      await registerUser({ email, password, firstName, lastName, phone, dpi });

      // Auto-login after successful registration
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 409
            ? 'Este correo ya está registrado.'
            : err.message || 'No se pudo crear la cuenta. Intenta de nuevo.'
          : 'No se pudo conectar con el servidor. Revisa tu conexión.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Disabled submit guard ──
  const loginDisabled  = isSubmitting || !email || !password;
  const registerDisabled = isSubmitting || !email || !password || !confirm || !firstName || !lastName || !phone || !dpi;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col md:flex-row overflow-hidden">

      {/* ── Left Branding Section (Desktop Only) ── */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="z-10 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-fixed text-4xl" data-icon="forest">forest</span>
          <span className="text-primary-fixed text-2xl font-bold tracking-tight">Hotel ILU</span>
        </div>

        <div className="z-10 max-w-md">
          <h1 className="text-primary-fixed text-5xl font-extrabold tracking-tighter leading-none mb-6">
            {mode === 'login' ? 'Entra al Santuario.' : 'Únete al Club ILU.'}
          </h1>
          <p className="text-on-primary-container text-lg leading-relaxed font-light">
            {mode === 'login'
              ? 'Vive la armonía entre el lujo moderno y la serenidad del bosque. Tu viaje comienza con un solo paso.'
              : 'Crea tu cuenta y descubre una experiencia única de hospitalidad en el corazón del bosque.'}
          </p>
        </div>

        {/* Background overlay image */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
          <img
            alt="Habitación de hotel de lujo con vista al bosque"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqCuZ_4RsXDd5WzqIIqb6QQwn2lAEiM4K5HmCR2YgppIMlFzAi3rZks5VQ670EhsJDEUR-z8vyLUtE4N6_F9uvQkNE7vAxJYzLmkKNrW_DVRvnZ5S-BuXEzQyN4rGKe8eFb4ngIkfXcF9QFMzqr4z5JlOlXdpLdn9yLd7pNVJ2czugTYsnRrZMT7ogjkzthjqRBRHxom61AaXSGUGB71c_jxdlYt1NCtt8rsl0E_CLPLqJfHnWs5p1aBFAB0fIn1tj1TmsPYaLRoM"
          />
        </div>
        <div className="absolute inset-0 bg-primary/30" />
      </section>

      {/* ── Right Panel ── */}
      <main className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-[440px] flex flex-col items-center">

          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center gap-3 mb-12">
            <span className="material-symbols-outlined text-primary text-5xl" data-icon="forest">forest</span>
            <span className="text-primary text-3xl font-black tracking-tighter">Hotel ILU</span>
          </div>

          {/* ── Card ── */}
          <div className="w-full bg-surface-container-low p-10 lg:p-12 rounded-lg border-[0.5px] border-outline-variant/20 shadow-sm">

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary tracking-tight mb-2">
                {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                {mode === 'login'
                  ? 'Ingresa tus datos para acceder a tu santuario.'
                  : 'Únete y comienza tu experiencia en Hotel ILU.'}
              </p>
            </div>

            {/* Alerts */}
            {error   && <AlertBanner type="error"   message={error} />}
            {success && <AlertBanner type="success" message={success} />}

            {/* ══════════ LOGIN FORM ══════════ */}
            {mode === 'login' && (
              <form className="space-y-6" onSubmit={handleLogin} noValidate>
                <div className="space-y-2">
                  <label className={labelCls} htmlFor="login-email">Correo electrónico</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="usuario@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className={inputCls}
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelCls} htmlFor="login-password">Contraseña</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      className={`${inputCls} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-lg" data-icon={showPassword ? 'visibility_off' : 'visibility'}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-4">
                  <button type="submit" disabled={loginDisabled} className={submitBtnCls}>
                    {isSubmitting ? <SpinnerLabel label="Iniciando sesión…" /> : 'Iniciar Sesión'}
                  </button>
                  <div className="text-center">
                    <a className="text-sm font-medium text-secondary hover:text-tertiary-container transition-colors" href="#">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                </div>
              </form>
            )}

            {/* ══════════ REGISTER FORM ══════════ */}
            {mode === 'register' && (
              <form className="space-y-6" onSubmit={handleRegister} noValidate>
                <div className="space-y-2">
                  <label className={labelCls} htmlFor="reg-email">Correo electrónico</label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="usuario@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className={inputCls}
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelCls} htmlFor="reg-password">Contraseña</label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      className={`${inputCls} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-lg" data-icon={showPassword ? 'visibility_off' : 'visibility'}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelCls} htmlFor="reg-confirm">Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      id="reg-confirm"
                      name="confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      disabled={isSubmitting}
                      className={`${inputCls} pr-12 ${
                        confirm && confirm !== password ? 'border-error' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-lg" data-icon={showConfirm ? 'visibility_off' : 'visibility'}>
                        {showConfirm ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-xs text-error font-medium mt-1">Las contraseñas no coinciden.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={labelCls} htmlFor="reg-firstName">Nombre</label>
                    <input
                      id="reg-firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      placeholder="Javier"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isSubmitting}
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls} htmlFor="reg-lastName">Apellido</label>
                    <input
                      id="reg-lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      placeholder="De León"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isSubmitting}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={labelCls} htmlFor="reg-phone">Teléfono</label>
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      placeholder="5555-1234"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      disabled={isSubmitting}
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls} htmlFor="reg-dpi">DPI</label>
                    <input
                      id="reg-dpi"
                      name="dpi"
                      type="text"
                      autoComplete="off"
                      required
                      placeholder="1234567890101"
                      value={dpi}
                      onChange={(e) => setDpi(e.target.value)}
                      disabled={isSubmitting}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={registerDisabled} className={submitBtnCls}>
                    {isSubmitting ? <SpinnerLabel label="Creando cuenta…" /> : 'Crear Cuenta'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Footer toggle ── */}
          <div className="mt-12 text-center">
            {mode === 'login' ? (
              <p className="text-on-surface-variant text-sm">
                ¿Nuevo en el Santuario?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="text-primary font-bold ml-1 hover:underline underline-offset-4 bg-transparent border-none cursor-pointer"
                >
                  Únete al Club ILU
                </button>
              </p>
            ) : (
              <p className="text-on-surface-variant text-sm">
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-primary font-bold ml-1 hover:underline underline-offset-4 bg-transparent border-none cursor-pointer"
                >
                  Iniciar Sesión
                </button>
              </p>
            )}
          </div>

          {/* Trust badge */}
          <div className="mt-16 hidden lg:flex items-center gap-4 px-8 py-4 bg-surface-container-high rounded-full opacity-60">
            <span className="material-symbols-outlined text-secondary text-sm" data-icon="verified_user">verified_user</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Portal de Acceso Seguro
            </span>
          </div>

        </div>
      </main>
    </div>
  );
}
