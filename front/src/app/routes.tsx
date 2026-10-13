import { BrowserRouter, Link, Route, Routes, useNavigate } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import AuthPage from "../pages/AuthPage";
import BuyerPage from "../pages/buyer";
import ProducerPage from "../pages/producer";
import CarrierPage from "../pages/carrier";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { ProfileRoute } from "../components/ProfileRoute";
import type { AuthMode, CadastroPayload, LoginPayload } from "../types/auth";

function AuthRoute({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (payload: LoginPayload) => {
    const session = await authService.login(payload);
    setAuth(session);
    navigate(`/${session.profile}`);
  };

  const handleCadastro = async (payload: CadastroPayload) => {
    const session = await authService.cadastro(payload);
    setAuth(session);
    navigate(`/${session.profile}`);
  };

  return <AuthPage initialMode={mode} onLogin={handleLogin} onCadastro={handleCadastro} />;
}

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fafaf8] px-5 text-center text-[#0b150c]">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-wide text-[#5e6b60]">Erro 404</p>
        <h1 className="mt-2 font-['Bricolage_Grotesque'] text-4xl font-extrabold">Página não encontrada</h1>
        <Link className="mt-6 inline-block font-extrabold text-[#2f681f] underline" to="/">Voltar para a página inicial</Link>
      </div>
    </main>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthRoute mode="entrar" />} />
        <Route path="/cadastro" element={<AuthRoute mode="criar" />} />

        {/* Rotas de perfil — requerem autenticação + perfil correto */}
        <Route
          path="/produtor"
          element={
            <ProtectedRoute>
              <ProfileRoute requiredProfile="produtor">
                <ProducerPage />
              </ProfileRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/comprador"
          element={
            <ProtectedRoute>
              <ProfileRoute requiredProfile="comprador">
                <BuyerPage />
              </ProfileRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transportador"
          element={
            <ProtectedRoute>
              <ProfileRoute requiredProfile="transportador">
                <CarrierPage />
              </ProfileRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
