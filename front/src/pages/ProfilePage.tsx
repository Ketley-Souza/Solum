import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, LogOut, Save, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileNavbar from "../components/ProfileNavbar";
import { userService } from "../services/userService";
import { useAuthStore } from "../stores/authStore";
import { useResetAllStores } from "../stores/hooks";
import type { Profile } from "../types/auth";

const PROFILE_LABELS: Record<Profile, string> = {
  comprador: "Comprador",
  produtor: "Produtor",
  transportador: "Transportador",
};

const NAVIGATION: Record<Profile, { label: string; href: string }[]> = {
  comprador: [
    { label: "Marketplace", href: "/comprador" },
    { label: "Meus pedidos", href: "/comprador/pedidos" },
  ],
  produtor: [
    { label: "Visão geral", href: "/produtor" },
    { label: "Ofertas", href: "/produtor/ofertas" },
    { label: "Negociações", href: "/produtor/negociacoes" },
    { label: "Pedidos", href: "/produtor/pedidos" },
  ],
  transportador: [
    { label: "Visão geral", href: "/transportador" },
    { label: "Fretes disponíveis", href: "/transportador/fretes-disponiveis" },
    { label: "Meus fretes", href: "/transportador/meus-fretes" },
    { label: "Histórico", href: "/transportador/historico" },
  ],
};

export default function ProfilePage({ profile }: { profile: Profile }) {
  const navigate = useNavigate();
  const resetAllStores = useResetAllStores();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp ?? "");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setWhatsapp(user.whatsapp ?? "");
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const updated = await userService.updateProfile({ name, email, whatsapp });
      updateUser({ name: updated.name, email: updated.email, whatsapp: updated.whatsapp });
      setFeedback({ type: "success", message: "Informações atualizadas com sucesso." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível atualizar suas informações.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    resetAllStores();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar
        profileName={user?.name ?? "Usuário"}
        role={PROFILE_LABELS[profile].toUpperCase()}
        links={NAVIGATION[profile]}
      />
      <main className="mx-auto max-w-3xl px-5 py-8 md:px-10">
        <div className="mb-7">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#287a48]">Minha conta</p>
          <h1 className="mt-1 font-['Bricolage_Grotesque'] text-3xl font-extrabold">Perfil</h1>
          <p className="mt-2 text-sm text-[#708077]">Atualize seus dados pessoais e gerencie o acesso à sua conta.</p>
        </div>

        <section className="rounded-2xl border border-[#dfe6dc] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-4 border-b border-[#e7ece4] pb-5">
            <span className="grid size-14 place-items-center rounded-full bg-[#2f681f] text-xl font-extrabold text-white">
              {(user?.name ?? "U").charAt(0).toUpperCase()}
            </span>
            <div>
              <h2 className="font-extrabold">{user?.name ?? "Usuário"}</h2>
              <p className="text-sm text-[#708077]">{PROFILE_LABELS[profile]}</p>
            </div>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-bold">
              Nome completo
              <span className="relative mt-2 block">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#809080]" size={17} />
                <input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-[#dfe6dc] bg-[#fbfcfa] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#9dcc2f] focus:ring-2 focus:ring-[#c1f23c]/40" />
              </span>
            </label>
            <label className="block text-sm font-bold">
              E-mail
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe6dc] bg-[#fbfcfa] px-3 py-3 text-sm outline-none focus:border-[#9dcc2f] focus:ring-2 focus:ring-[#c1f23c]/40" />
            </label>
            <label className="block text-sm font-bold">
              Número de WhatsApp
              <input required type="tel" autoComplete="tel" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe6dc] bg-[#fbfcfa] px-3 py-3 text-sm outline-none focus:border-[#9dcc2f] focus:ring-2 focus:ring-[#c1f23c]/40" />
            </label>

            {feedback && (
              <p className={`flex items-center gap-2 rounded-xl p-3 text-sm ${feedback.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
                {feedback.type === "success" && <CheckCircle2 size={17} />}
                {feedback.message}
              </p>
            )}

            <div className="flex flex-wrap justify-between gap-3 pt-2">
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50">
                <LogOut size={17} /> Sair da conta
              </button>
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#173b21] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#24552e] disabled:cursor-not-allowed disabled:opacity-60">
                <Save size={17} /> {loading ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
