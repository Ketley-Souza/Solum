import logoImage from "../assets/logo.svg";

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="font-['Bricolage_Grotesque'] text-[15px]">{title}</h3>
      {links.map((link) => (
        <a
          className="mt-3 block text-[13px] text-white/60 transition-colors hover:text-white first:mt-4 last:text-[#c1f23c] last:hover:text-[#d1fa62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
          href="#inicio"
          key={link}
        >
          {link}
        </a>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0b150c] px-5 pb-12 pt-24 text-white md:px-[5.55%]">
      <div className="flex flex-col justify-between gap-16 md:flex-row">
        <div className="max-w-102.75">
          <a
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
            href="#inicio"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-[#c1f23c]">
              <img src={logoImage} alt="" className="size-10" />
            </span>
            <span>
              <strong className="block font-serif text-[22px] leading-none">
                SOLUM
              </strong>
              <small className="mt-1 block text-[9px] font-extrabold tracking-wide text-[#c1f23c]">
                AGRICULTURAL B2B
              </small>
            </span>
          </a>
          <p className="my-6 text-sm leading-6 text-white/80">
            O ecossistema inteligente de comércio agrícola. Otimizando
            conexões, simplificando fluxos logísticos e garantindo
            negociações transparentes para o agronegócio nacional.
          </p>
          <div className="flex gap-3">
            {["◎", "▶", "in", "f"].map((icon, i) => (
              <a
                key={i}
                aria-label={["Instagram", "YouTube", "LinkedIn", "Facebook"][i]}
                href="#inicio"
                className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-16">
          <FooterColumn
            title="Plataforma"
            links={["Marketplace", "Como Funciona", "Cotações do Cerrado", "Hub de Logística"]}
          />
          <FooterColumn
            title="Institucional"
            links={["Sobre Nós", "FAQ / Dúvidas", "Termos de Uso", "Privacidade"]}
          />
          <FooterColumn
            title="Contato & Suporte"
            links={["contato@solum.com.br", "(34) 99999-0000", "Patos de Minas - MG", "Falar com especialista →"]}
          />
        </div>
      </div>
      <div className="mt-16 flex flex-col justify-between gap-3 border-t border-[#182c1e] pt-8 text-xs text-white/40 md:flex-row">
        <span>
          © 2026 Solum Tecnologia Agrícola S.A. Todos os direitos reservados.
          Patos de Minas, Minas Gerais, Brasil.
        </span>
        <span>Privacidade&nbsp;&nbsp;&nbsp; Termos Gerais</span>
      </div>
    </footer>
  );
}
