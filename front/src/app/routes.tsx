import { useEffect } from "react";
import {
  createBrowserRouter,
  Link,
  RouterProvider,
  useNavigate,
  useParams,
  useRouteError,
} from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import AuthPage from "../pages/AuthPage";
import BuyerPage from "../pages/buyer";
import BuyerOrdersPage from "../pages/buyer/orders";
import BuyerNegotiationPage from "../pages/buyer/negotiation";
import BuyerNotificationsPage from "../pages/buyer/notifications";
import ProducerPage from "../pages/producer";
import CarrierPage from "../pages/carrier";
import AvailableFreightsPage from "../pages/carrier/available-freights";
import MyFreightsPage from "../pages/carrier/my-freights";
import CarrierHistoryPage from "../pages/carrier/history";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { RequireProfile, PROFILE_HOME } from "../components/RequireProfile";
import type {
  AuthMode,
  CadastroPayload,
  LoginPayload,
  Profile,
} from "../types/auth";

function AuthRoute({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (payload: LoginPayload) => {
    const session = await authService.login(payload);
    setAuth(session);
    navigate(PROFILE_HOME[session.profile], { replace: true });
  };

  const handleCadastro = async (payload: CadastroPayload) => {
    const session = await authService.cadastro(payload);
    setAuth(session);
    navigate(PROFILE_HOME[session.profile], { replace: true });
  };

  return (
    <AuthPage
      initialMode={mode}
      onLogin={handleLogin}
      onCadastro={handleCadastro}
    />
  );
}

/**
 * SOMENTE DESENVOLVIMENTO: cria uma sessão falsa e entra direto no perfil.
 * Acesse, por exemplo, http://localhost:5173/dev/entrar/transportador
 * A rota só é registrada quando import.meta.env.DEV é true (npm run dev).
 */
function DevLogin() {
  const { perfil } = useParams<{ perfil: Profile }>();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    if (!perfil || !(perfil in PROFILE_HOME)) {
      navigate("/", { replace: true });
      return;
    }

    setAuth({
      token: "dev",
      profile: perfil,
      user: { id: "dev", name: "Usuário Teste", email: "teste@solum.dev" },
    });
    navigate(PROFILE_HOME[perfil], { replace: true });
  }, [perfil, setAuth, navigate]);

  return null;
}

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fafaf8] px-5 text-center text-[#0b150c]">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-wide text-[#5e6b60]">
          Erro 404
        </p>

        <h1 className="mt-2 font-['Bricolage_Grotesque'] text-4xl font-extrabold">
          Página não encontrada
        </h1>

        <Link
          className="mt-6 inline-block font-extrabold text-[#2f681f] underline"
          to="/"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  );
}

// Aparece no lugar da "tela branca": erro de renderização dentro das rotas cai aqui.
function ErrorPage() {
  const error = useRouteError();
  console.error("Erro de rota/renderização:", error);

  return (
    <main className="grid min-h-screen place-items-center bg-[#fafaf8] px-5 text-center text-[#0b150c]">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-wide text-[#5e6b60]">
          Algo deu errado
        </p>
        <h1 className="mt-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold">
          Não foi possível carregar esta tela
        </h1>
        <p className="mt-2 text-sm text-[#66736a]">
          {error instanceof Error ? error.message : "Erro inesperado."}
        </p>
        <Link
          className="mt-6 inline-block font-extrabold text-[#2f681f] underline"
          to="/"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  );
}

const router = createBrowserRouter([
  {
    // Rota raiz sem path: existe só para aplicar o errorElement a tudo.
    errorElement: <ErrorPage />,
    children: [
      // Públicas
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <AuthRoute mode="entrar" /> },
      { path: "/cadastro", element: <AuthRoute mode="criar" /> },

      // Atalho de desenvolvimento (não existe no build de produção)
      // /dev/entrar/transportador
      // /dev/entrar/comprador
      // /dev/entrar/produtor
      ...(import.meta.env.DEV
        ? [{ path: "dev/entrar/:perfil", element: <DevLogin /> }]
        : []),

      // Produtor
      {
        path: "produtor",
        element: <RequireProfile profile="produtor" />,
        children: [
          { index: true, element: <ProducerPage /> },
        ],
      },

      // Comprador
      {
        path: "comprador",
        element: <RequireProfile profile="comprador" />,
        children: [
          { index: true, element: <BuyerPage /> },
          { path: "pedidos", element: <BuyerOrdersPage /> },
          { path: "notificacoes", element: <BuyerNotificationsPage /> },
          { path: "negociacao/:offerId", element: <BuyerNegotiationPage /> },
        ],
      },

      // Transportador
      {
        path: "transportador",
        element: <RequireProfile profile="transportador" />,
        children: [
          { index: true, element: <CarrierPage /> },
          { path: "fretes-disponiveis", element: <AvailableFreightsPage /> },
          { path: "meus-fretes", element: <MyFreightsPage /> },
          { path: "historico", element: <CarrierHistoryPage /> },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

// Mesmo nome exportado de antes: main.tsx / App.tsx não mudam.
export function AppRoutes() {
  return <RouterProvider router={router} />;
}
