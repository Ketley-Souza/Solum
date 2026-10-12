import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import HomeNavbar from "../components/HomeNavbar";

export default function AuthPage({ mode }: { mode: "login" | "cadastro" }) {
  const isLogin = mode === "login";
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="min-h-screen bg-[#fafaf8] font-['Manrope'] text-[#0b150c]">
      <HomeNavbar />
      <main className="flex min-h-[calc(100vh-94px)] items-center justify-center px-5 py-16">
        <section className="w-full max-w-md rounded-3xl border border-[#e3e5df] bg-white p-7 shadow-[0_12px_32px_rgba(11,21,12,.08)] md:p-10">
          <span className="text-xs font-extrabold uppercase tracking-wide text-[#5e6b60]">
            Solum Agricultural B2B
          </span>
          <h1 className="mt-3 font-['Bricolage_Grotesque'] text-4xl font-extrabold">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#5e6b60]">
            {isLogin
              ? "Entre para continuar suas negociações no campo digital."
              : "Comece a negociar com produtores, compradores e transportadores."}
          </p>
          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => event.preventDefault()}
          >
            {!isLogin && (
              <label className="block text-xs font-bold text-[#4a5d4e]">
                Nome completo
                <input
                  className="mt-2 w-full rounded-xl border border-[#e3e5df] px-4 py-3 text-sm outline-none transition focus:border-[#2f681f] focus:ring-2 focus:ring-[#c1f23c]"
                  placeholder="João Ribeiro"
                />
              </label>
            )}
            <label className="block text-xs font-bold text-[#4a5d4e]">
              E-mail
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-[#e3e5df] px-4 py-3 text-sm outline-none transition focus:border-[#2f681f] focus:ring-2 focus:ring-[#c1f23c]"
                placeholder="voce@empresa.com"
              />
            </label>
            <label className="block text-xs font-bold text-[#4a5d4e]">
              Senha
              <span className="relative mt-2 block">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-[#e3e5df] px-4 py-3 pr-11 text-sm outline-none transition focus:border-[#2f681f] focus:ring-2 focus:ring-[#c1f23c]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#708077] transition hover:text-[#194e16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2f681f] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#3b8128] active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
            >
              {isLogin ? "Entrar" : "Criar conta"} <ArrowRight size={16} />
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#5e6b60]">
            {isLogin ? "Ainda não tem uma conta?" : "Já tem uma conta?"}{" "}
            <a
              className="font-bold text-[#2f681f] underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
              href={isLogin ? "/cadastro" : "/login"}
            >
              {isLogin ? "Cadastre-se" : "Entrar"}
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
