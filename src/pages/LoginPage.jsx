import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Mountain, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/ui/LoadingScreen'

// EDIT HERE — the error text shown for each Firebase error code. Add more
// codes here (as you hit them) to keep messages in plain English instead of
// Firebase's raw "auth/xyz" codes.
// Guide: Read_Me/HOW_TO_MAKE_CHANGES.md -> "Login / Account"
const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'That email already has an account — try logging in instead.',
  'auth/invalid-email': "That doesn't look like a valid email address.",
  'auth/weak-password': 'Password needs to be at least 6 characters.',
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/too-many-requests': 'Too many attempts — wait a minute and try again.',
}

export default function LoginPage() {
  const { signUp, logIn, resetPassword, firebaseUser, loading } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [busy, setBusy] = useState(false)

  // Already signed in — either this page just finished a signup/login, or
  // Firebase remembered a session from before. Either way, don't keep
  // showing the form: hand off to App.jsx's RequireAuth, which knows
  // whether that lands you in the app or on the pending/removed screen.
  // Without this, a successful signup or login looked like "nothing
  // happened", because the URL never actually left /login.
  if (loading) return <LoadingScreen />
  if (firebaseUser) return <Navigate to="/" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setResetSent(false)
    setBusy(true)
    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password, name.trim())
      } else {
        await logIn(email.trim(), password)
      }
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] ?? `Something went wrong (${err.code ?? 'unknown error'}) — try again.`)
    } finally {
      setBusy(false)
    }
  }

  // Forgets you don't need a password to change your password — this is
  // the real fix for "I forgot my password" or "I want to change the
  // Owner's password": type the email above, tap this, follow the emailed
  // link. Works for every account, including the Owner's own.
  async function handleForgotPassword() {
    setError('')
    setResetSent(false)
    if (!email.trim()) {
      setError('Type your email above first, then tap "Forgot password?" again.')
      return
    }
    try {
      await resetPassword(email)
      setResetSent(true)
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] ?? `Something went wrong (${err.code ?? 'unknown error'}) — try again.`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <Mountain className="mx-auto h-9 w-9 text-mountain-400" />
        <p className="mt-2 font-display text-xl font-semibold text-white">TRIPVERSE</p>
        <p className="text-sm text-slate-400">Himachal Expedition 2026</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-navy-800 p-5">
        <div className="mb-4 flex rounded-full bg-white/5 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-full py-1.5 transition-colors ${
              mode === 'login' ? 'bg-mountain-500 text-white' : 'text-slate-400'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-full py-1.5 transition-colors ${
              mode === 'signup' ? 'bg-mountain-500 text-white' : 'text-slate-400'
            }`}
          >
            Sign up
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {mode === 'signup' && (
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              required
              className="rounded-xl border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-mountain-400"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            className="rounded-xl border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-mountain-400"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="w-full rounded-xl border border-white/10 bg-navy-900 px-3 py-2 pr-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-mountain-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {mode === 'login' && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-right text-xs text-mountain-400 hover:underline"
            >
              Forgot password?
            </button>
          )}
        </div>

        {error && <p className="mt-3 text-xs text-status-disputed">{error}</p>}
        {resetSent && (
          <p className="mt-3 text-xs text-status-completed">
            Check {email.trim()} for a reset link — open it to set a new password.
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-mountain-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mountain-400 disabled:opacity-60"
        >
          {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
        </button>

        {mode === 'signup' && (
          <p className="mt-3 text-center text-[11px] text-slate-500">
            The trip Owner's account is already set up. Everyone else needs the Owner's
            approval from the Admin dashboard before they can get in.
          </p>
        )}
      </form>
    </div>
  )
}
