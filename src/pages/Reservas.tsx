import { useCallback, useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { ChevronLeft, ChevronRight, LogOut, MessageCircle, RefreshCw } from 'lucide-react'
import { brand } from '../data/site'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import {
  fetchReservas,
  formatDay,
  formatPhone,
  formatTime,
  phoneHref,
  setStatus,
  type Reserva,
} from '../lib/reservas'

export function Reservas() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setChecking(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <p className="text-lg text-cream">
          O painel precisa das variáveis do Supabase para funcionar.
        </p>
      </Shell>
    )
  }

  if (checking) {
    return (
      <Shell>
        <p className="font-mono text-xs tracking-widest text-smoke uppercase">Verificando acesso…</p>
      </Shell>
    )
  }

  return session ? <Board email={session.user.email ?? ''} /> : <Login />
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <img
          src="/logo-familia-grill.png"
          alt=""
          width={72}
          height={72}
          className="size-18 rounded-full bg-white"
        />
        <p className="eyebrow mt-6">Painel da equipe</p>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!supabase) return

    setBusy(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: senha })
    setBusy(false)

    if (authError) {
      setError('E-mail ou senha não conferem.')
    }
  }

  return (
    <Shell>
      <h1 className="display text-3xl text-cream">Entrar</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="eyebrow">E-mail</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-b border-char bg-transparent py-2.5 text-cream outline-none transition-colors focus:border-gold"
          />
        </label>
        <label className="block">
          <span className="eyebrow">Senha</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="mt-2 w-full border-b border-char bg-transparent py-2.5 text-cream outline-none transition-colors focus:border-gold"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-gold px-6 py-4 font-mono text-xs font-bold tracking-widest text-coal uppercase transition-colors hover:bg-cream disabled:opacity-60"
        >
          {busy ? 'Entrando…' : 'Entrar'}
        </button>

        {error && (
          <p role="alert" className="font-mono text-xs text-ember">
            {error}
          </p>
        )}
      </form>

      <p className="mt-8 font-mono text-[11px] leading-relaxed text-smoke">
        Acesso restrito à equipe. As contas são criadas pelo painel do Supabase.
      </p>
    </Shell>
  )
}

function Board({ email }: { email: string }) {
  const [day, setDay] = useState(() => new Date())
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [problem, setProblem] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setProblem('')
    try {
      setReservas(await fetchReservas(day))
    } catch {
      setProblem('Não foi possível carregar as reservas. Sua conta pode não estar na lista da equipe.')
    } finally {
      setLoading(false)
    }
  }, [day])

  useEffect(() => {
    void load()
  }, [load])

  async function change(id: string, status: Reserva['status']) {
    const previous = reservas
    setReservas((list) => list.map((r) => (r.id === id ? { ...r, status } : r)))
    try {
      await setStatus(id, status)
    } catch {
      setReservas(previous)
      setProblem('A alteração não foi salva. Tente de novo.')
    }
  }

  const shiftDay = (offset: number) => {
    const next = new Date(day)
    next.setDate(next.getDate() + offset)
    setDay(next)
  }

  const ativas = reservas.filter((r) => r.status !== 'cancelada')
  const lugares = ativas.reduce((total, r) => total + r.pessoas, 0)

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-char bg-coal/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo-familia-grill.png"
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-full bg-white"
            />
            <span className="display text-sm text-cream">Reservas</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void load()}
              aria-label="Atualizar lista"
              className="grid size-9 place-items-center border border-char text-smoke transition-colors hover:border-gold hover:text-gold"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => supabase?.auth.signOut()}
              className="inline-flex items-center gap-2 border border-char px-3 py-2 font-mono text-[11px] tracking-widest text-smoke uppercase transition-colors hover:border-gold hover:text-gold"
            >
              <LogOut className="size-3.5" aria-hidden />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => shiftDay(-1)}
            aria-label="Dia anterior"
            className="grid size-10 place-items-center border border-char text-cream transition-colors hover:border-gold hover:text-gold"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>

          <div className="text-center">
            <p className="display text-xl text-cream">{formatDay(day)}</p>
            <p className="mt-1 font-mono text-[11px] tracking-widest text-smoke uppercase">
              {ativas.length} {ativas.length === 1 ? 'mesa' : 'mesas'} · {lugares}{' '}
              {lugares === 1 ? 'lugar' : 'lugares'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => shiftDay(1)}
            aria-label="Próximo dia"
            className="grid size-10 place-items-center border border-char text-cream transition-colors hover:border-gold hover:text-gold"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>

        {problem && (
          <p role="alert" className="mt-8 border border-ember/40 px-5 py-4 font-mono text-xs leading-relaxed text-ember">
            {problem}
          </p>
        )}

        {!problem && !loading && reservas.length === 0 && (
          <p className="mt-16 text-center font-mono text-xs tracking-widest text-smoke uppercase">
            Nenhuma mesa reservada nesta noite
          </p>
        )}

        <ul className="mt-8 space-y-3">
          {reservas.map((reserva) => (
            <li
              key={reserva.id}
              className={`border p-5 transition-colors ${
                reserva.status === 'cancelada'
                  ? 'border-char opacity-50'
                  : reserva.status === 'confirmada'
                    ? 'border-sage/40'
                    : 'border-char'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="flex items-baseline gap-3">
                    <span className="display text-2xl text-cream">{formatTime(reserva.data_hora)}</span>
                    <span className="text-lg text-cream">{reserva.nome}</span>
                  </p>
                  <p className="mt-1 font-mono text-xs text-smoke">
                    {reserva.pessoas} {reserva.pessoas === 1 ? 'pessoa' : 'pessoas'} ·{' '}
                    <a
                      href={phoneHref(reserva.telefone)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-gold hover:underline"
                    >
                      <MessageCircle className="size-3" aria-hidden />
                      {formatPhone(reserva.telefone)}
                    </a>
                  </p>
                  {reserva.observacao && (
                    <p className="mt-3 max-w-md text-sm text-smoke italic">“{reserva.observacao}”</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void change(reserva.id, 'confirmada')}
                    disabled={reserva.status === 'confirmada'}
                    className="border border-sage/40 px-3 py-2 font-mono text-[11px] tracking-widest text-sage uppercase transition-colors hover:bg-sage hover:text-coal disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-sage"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => void change(reserva.id, 'cancelada')}
                    disabled={reserva.status === 'cancelada'}
                    className="border border-char px-3 py-2 font-mono text-[11px] tracking-widest text-smoke uppercase transition-colors hover:border-ember hover:text-ember disabled:opacity-40"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-16 font-mono text-[11px] text-smoke/60">
          {email} · {brand.fullName}
        </p>
      </main>
    </div>
  )
}
