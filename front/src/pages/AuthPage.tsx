import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  Phone,
  Shield,
  Truck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero.jpg";
import logoImage from "../assets/logo.svg";
import type { CadastroPayload, LoginPayload, Profile, AuthMode } from "../types/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Profile config
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileMeta {
  id: Profile;
  label: string;
  description: string;
  icon: typeof Leaf;
  documentLabel: string;
  documentPlaceholder: string;
}

const PROFILES: ProfileMeta[] = [
  {
    id: "produtor",
    label: "Produtor",
    description: "Publicar lotes e vender",
    icon: Leaf,
    documentLabel: "CPF ou CNPJ",
    documentPlaceholder: "000.000.000-00",
  },
  {
    id: "comprador",
    label: "Comprador",
    description: "Buscar e negociar ofertas",
    icon: Building2,
    documentLabel: "CNPJ da empresa",
    documentPlaceholder: "00.000.000/0000-00",
  },
  {
    id: "transportador",
    label: "Transportador",
    description: "Encontrar cargas e rotas",
    icon: Truck,
    documentLabel: "CPF ou CNPJ",
    documentPlaceholder: "000.000.000-00",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Field
// ─────────────────────────────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  icon: typeof Mail;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}

function Field({ id, label, placeholder, type = "text", icon: Icon, value, onChange, autoComplete }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[#7a8c7e]">
        {label}
      </label>
      <span className="relative block">
        <Icon size={14} strokeWidth={1.8} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#97a89a]" />
        <input
          id={id} type={type} required value={value} autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-xl border border-[#e2e8e0] bg-white py-3 pl-10 pr-4 text-sm font-medium text-[#0f1f12] outline-none transition placeholder:text-[#b4c2b6] hover:border-[#b5c9b6] focus:border-[#2f681f] focus:ring-2 focus:ring-[#2f681f]/15"
        />
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PasswordField
// ─────────────────────────────────────────────────────────────────────────────

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}

function PasswordField({ id, label, placeholder, hint, value, onChange, autoComplete = "current-password" }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[#7a8c7e]">{label}</label>
      <span className="relative block">
        <Lock size={14} strokeWidth={1.8} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#97a89a]" />
        <input
          id={id} type={show ? "text" : "password"} required value={value} autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-xl border border-[#e2e8e0] bg-white py-3 pl-10 pr-11 text-sm font-medium text-[#0f1f12] outline-none transition placeholder:text-[#b4c2b6] hover:border-[#b5c9b6] focus:border-[#2f681f] focus:ring-2 focus:ring-[#2f681f]/15"
        />
        <button type="button" aria-label={show ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#8fa895] transition hover:text-[#1e4e18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </span>
      {hint && <p className="text-[11px] leading-4 text-[#9dab9f]">{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfileCard
// ─────────────────────────────────────────────────────────────────────────────

function ProfileCard({ meta, selected, onSelect }: { meta: ProfileMeta; selected: boolean; onSelect: () => void }) {
  const Icon = meta.icon;
  return (
    <button
      type="button" id={`profile-btn-${meta.id}`} aria-pressed={selected} onClick={onSelect}
      className={[
        "relative flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]",
        selected ? "border-[#2f681f] bg-[#f0f9e8] shadow-[0_0_0_1px_#2f681f]" : "border-[#e2e8e0] bg-white hover:border-[#afc9ab] hover:bg-[#fafdf8]",
      ].join(" ")}
    >
      <span aria-hidden="true" className={["absolute right-3 top-3 size-4 rounded-full border-2 transition-colors duration-150", selected ? "border-[#2f681f] bg-[#2f681f]" : "border-[#c8d8c5] bg-white"].join(" ")}>
        {selected && <span className="absolute inset-0 flex items-center justify-center"><span className="size-1.5 rounded-full bg-white" /></span>}
      </span>
      <span className={["grid size-9 place-items-center rounded-xl transition-colors duration-150", selected ? "bg-[#2f681f] text-[#c1f23c]" : "bg-[#edf2ec] text-[#5d7a60]"].join(" ")}>
        <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="pr-5">
        <strong className={["block text-sm font-extrabold leading-tight", selected ? "text-[#163b1a]" : "text-[#2a3c2c]"].join(" ")}>{meta.label}</strong>
        <small className="mt-0.5 block text-[10px] leading-4 text-[#7d9180]">{meta.description}</small>
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AuthPage
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthPageProps {
  initialMode?: AuthMode;
  onLogin?: (payload: LoginPayload) => Promise<void> | void;
  onCadastro?: (payload: CadastroPayload) => Promise<void> | void;
}

export default function AuthPage({ initialMode = "criar", onLogin, onCadastro }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [profile, setProfile] = useState<Profile>("produtor");
  const isCriar = mode === "criar";

  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProfile = PROFILES.find((p) => p.id === profile)!;

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setNome(""); setDocumento(""); setEmail(""); setWhatsapp(""); setPassword(""); setTerms(false); setError(null);
  };

  const switchProfile = (p: Profile) => {
    setProfile(p); setNome(""); setDocumento(""); setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCriar && !terms) { setError("Você precisa aceitar os Termos de Uso para continuar."); return; }
    setError(null); setLoading(true);
    try {
      if (!isCriar) {
        const payload: LoginPayload = { profile, email, password };
        if (!onLogin) {
          throw new Error("A autenticação ainda não está configurada.");
        }
        await onLogin(payload);
      } else {
        const payload: CadastroPayload = { profile, nome, documento, email, whatsapp, password };
        if (!onCadastro) {
          throw new Error("O cadastro ainda não está configurado.");
        }
        await onCadastro(payload);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared header + profile selector (same in both modes)
  const sharedTop = (
    <>
      {/* Tab toggle */}
      <div className="flex rounded-2xl bg-[#f0f0ec] p-1">
        {(["entrar", "criar"] as AuthMode[]).map((m) => (
          <button key={m} type="button" id={m === "entrar" ? "tab-entrar" : "tab-criar"}
            onClick={() => switchMode(m)}
            className={["flex-1 rounded-xl py-2.5 text-sm font-extrabold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]",
              mode === m ? "bg-white text-[#0f1f12] shadow-sm" : "text-[#7a8c7e] hover:text-[#2a3c2c]"].join(" ")}
          >
            {m === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      {/* Title */}
      <div className="mt-6">
        <h2 className="font-['Bricolage_Grotesque'] text-[1.6rem] font-extrabold leading-tight sm:text-[1.85rem]">
          {isCriar ? "Comece pela sua atuação no agro" : "Entre na sua conta"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#677a6c]">
          {isCriar
            ? "Seu perfil personaliza ofertas, rotas e documentos."
            : "Selecione seu perfil e acesse sua conta para continuar negociando."}
        </p>
      </div>

      {/* Profile selector */}
      <div className="mt-6">
        <p className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[#7a8c7e]">Como você quer usar a Solum?</p>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {PROFILES.map((meta) => (
            <ProfileCard key={meta.id} meta={meta} selected={profile === meta.id} onSelect={() => switchProfile(meta.id)} />
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f0ede6] font-['Manrope'] text-[#0b150c]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 sm:px-8 lg:px-[5.5%]">
        <Link to="/" aria-label="Solum início" className="flex items-center gap-2.5 text-[#15371e] transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]">
          <img src={logoImage} alt="" className="size-8" />
          <span>
            <strong className="block font-serif text-lg leading-none">SOLUM</strong>
            <small className="mt-0.5 block text-[8px] font-extrabold tracking-widest text-[#4a5d4e]">AGRICULTURAL B2B</small>
          </span>
        </Link>
      </header>

      {/* Two-column layout */}
      <div className="mx-auto grid w-full max-w-[1200px] items-stretch gap-6 px-5 pb-12 sm:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)] lg:gap-7 lg:px-10">

        {/* LEFT — hero panel */}
        <div className="relative hidden overflow-hidden rounded-[1.75rem] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(180deg, rgba(10,28,14,.55) 0%, rgba(10,28,14,.35) 40%, rgba(10,28,14,.82) 100%), url(${heroImage})` }} />
          <div className="relative z-10 flex h-full flex-col justify-between p-8 text-white xl:p-10">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-white backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[#c1f23c]" /> Uma cadeia, mais conexão
            </span>
            <div className="mt-auto">
              <h1 className="font-['Bricolage_Grotesque'] text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[1.08]">
                O agro inteiro encontra seu próximo passo aqui.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-[1.75] text-white/75">
                Conectamos quem produz, quem compra e quem transporta com negociações transparentes, logística integrada e confiança do campo ao destino.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10">
                {[["12.500+ t", "negociadas"], ["1.200+", "parceiros"], ["14", "estados"]].map(([value, label]) => (
                  <div key={label} className="flex flex-col gap-0.5 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <strong className="font-['Bricolage_Grotesque'] text-lg font-extrabold leading-none text-[#c1f23c]">{value}</strong>
                    <span className="text-[10px] text-white/60">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col rounded-[1.75rem] bg-white p-6 shadow-[0_8px_40px_rgba(15,30,18,.09)] sm:p-8">

          {sharedTop}

          {isCriar && (
            <form id="form-criar-conta" onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="nome" label="Nome completo" placeholder="Rafael Souza" icon={UserRound} value={nome} onChange={setNome} autoComplete="name" />
                <Field id="documento" label={activeProfile.documentLabel} placeholder={activeProfile.documentPlaceholder} icon={Building2} value={documento} onChange={setDocumento} autoComplete="off" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="email" label="E-mail" placeholder="rafael@fazendaboavista.com.br" type="email" icon={Mail} value={email} onChange={setEmail} autoComplete="email" />
                <Field id="whatsapp" label="WhatsApp" placeholder="(34) 9 9876-5432" icon={Phone} value={whatsapp} onChange={setWhatsapp} autoComplete="tel" />
              </div>
              <PasswordField id="password" label="Crie uma senha" placeholder="••••••••••••" hint="Use ao menos 8 caracteres, uma letra maiúscula e um número." value={password} onChange={setPassword} autoComplete="new-password" />

              <label className="flex cursor-pointer items-start gap-3">
                <span className="relative mt-0.5 shrink-0">
                  <input id="terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="peer sr-only" />
                  <span aria-hidden="true" className={["flex size-5 items-center justify-center rounded-md border-2 transition-colors duration-150", terms ? "border-[#2f681f] bg-[#2f681f]" : "border-[#c8d8c5] bg-white"].join(" ")}>
                    {terms && <Check size={12} strokeWidth={3} className="text-white" />}
                  </span>
                </span>
                <span className="text-xs leading-5 text-[#677a6c]">
                  Li e aceito os{" "}<a href="#" className="font-bold text-[#2f681f] hover:underline">Termos de Uso</a>{" "}e a{" "}<a href="#" className="font-bold text-[#2f681f] hover:underline">Política de Privacidade</a>{" "}da Solum.
                </span>
              </label>

              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

              <button id="btn-submit-criar" type="submit" disabled={loading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#c1f23c] px-5 py-4 text-sm font-extrabold text-[#0b150c] transition-colors hover:bg-[#d1fa62] active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]">
                {loading ? "Aguarde…" : <><span>Criar minha conta</span><ArrowRight size={16} strokeWidth={2.5} /></>}
              </button>
            </form>
          )}

          {!isCriar && (
            <form id="form-entrar" onSubmit={handleSubmit} noValidate className="mt-6 flex flex-1 flex-col">
              <div className="space-y-5">
                <Field id="email" label="E-mail" placeholder="voce@empresa.com" type="email" icon={Mail} value={email} onChange={setEmail} autoComplete="email" />
                <div className="space-y-2">
                  <PasswordField id="password" label="Senha" placeholder="••••••••" value={password} onChange={setPassword} autoComplete="current-password" />
                  <div className="text-right">
                    <a href="#" className="text-xs font-bold text-[#2f681f] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]">
                      Esqueci minha senha
                    </a>
                  </div>
                </div>
              </div>

              {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

              <div className="mt-auto space-y-4 pt-8">
                <button id="btn-submit-entrar" type="submit" disabled={loading}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#c1f23c] px-5 py-4 text-sm font-extrabold text-[#0b150c] transition-colors hover:bg-[#d1fa62] active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]">
                  {loading ? "Aguarde…" : <><span>Entrar na minha conta</span><ArrowRight size={16} strokeWidth={2.5} /></>}
                </button>
                <div className="flex items-center gap-2.5 rounded-xl bg-[#f4f8f2] px-4 py-3">
                  <Shield size={15} strokeWidth={1.8} className="shrink-0 text-[#2f681f]" />
                  <p className="text-[11px] leading-4 text-[#5e7263]">Ambiente protegido. Seus dados e a negociação são validados pela Solum.</p>
                </div>
                <p className="text-center text-[11px] text-[#8a9d8e]">Novo por aqui? Use a opção &quot;Criar conta&quot; no topo.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
