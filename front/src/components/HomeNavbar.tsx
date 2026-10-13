import logoImage from '../assets/logo.svg'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HomeNavbar() {
  const links = [['Início', '#inicio'], ['Marketplace', '#ofertas'], ['Como Funciona', '#como-funciona'], ['Sobre', '#sobre']]

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e3e5df] bg-white px-5 py-5 md:h-23.5 md:px-[5.55%]">
      <a className="flex items-center gap-2.5 text-[#15371e] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]" href="#inicio" aria-label="Solum início">
        <span className="grid size-9 place-items-center rounded-lg"><img src={logoImage} alt="" className="size-9" /></span>
        <span><strong className="block font-serif text-xl leading-none">SOLUM</strong><small className="mt-1 block text-[9px] font-extrabold tracking-wide text-[#4a5d4e]">AGRICULTURAL B2B</small></span>
      </a>
      <nav className="order-3 flex w-full gap-1 overflow-x-auto rounded-full bg-[#fafaf8] p-1 md:order-0 md:w-auto" aria-label="Navegação principal">
        {links.map(([label, href], index) => <a className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-2.5 text-[13px] font-bold transition-[background-color,color,box-shadow] duration-300 ease-out hover:bg-white hover:text-[#141f16] hover:shadow-[0_2px_4px_rgba(0,0,0,.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c] ${index === 0 ? 'bg-white text-[#141f16] shadow-[0_2px_4px_rgba(0,0,0,.04)]' : 'text-[#5e6b60]'}`} href={href} key={label}>{label}</a>)}
      </nav>
      <Link to="/login" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#15371e] px-5 py-3 text-[13px] font-bold text-[#15371e] transition-[background-color,color,border-color,transform] duration-300 ease-out hover:border-[#fff] hover:bg-[#eef5e8] hover:text-[#194e16] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]">Entrar <ArrowRight size={15} strokeWidth={2.25} aria-hidden="true" /></Link>
    </header>
  )
}
