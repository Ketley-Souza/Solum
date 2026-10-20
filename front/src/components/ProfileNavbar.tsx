import logoImage from '../assets/logo.svg'
import {
  Bell,
  ChevronDown,
  Handshake,
  LayoutDashboard,
  PackageCheck,
  Store,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

type ProfileNavLink = { label: string; href: string }

type ProfileNavbarProps = {
  profileName: string
  role?: string
  links: ProfileNavLink[]
}

export default function ProfileNavbar({ profileName, role, links }: ProfileNavbarProps) {
  const navIcons: LucideIcon[] = [LayoutDashboard, Store, Handshake, PackageCheck]
  const location = useLocation()
  const [currentHash, setCurrentHash] = useState(() =>
    typeof window === 'undefined' ? location.hash : window.location.hash,
  )

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash)
    window.addEventListener('hashchange', updateHash)
    return () => window.removeEventListener('hashchange', updateHash)
  }, [])

  useEffect(() => {
    setCurrentHash(location.hash)
  }, [location.hash])

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dde3da] bg-white px-5 py-4 md:h-19 md:px-12">
      <Link className="flex items-center gap-2.5 text-[#15371e] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]" to="/" aria-label="Solum início">
        <span className="grid size-9 place-items-center rounded-lg"><img src={logoImage} alt="" className="size-9" /></span>
        <span><strong className="block font-sans text-xl font-extrabold leading-none text-[#194e16]">SOLUM</strong><small className="mt-1 block text-[9px] font-bold text-[#708077]">AGRONEGÓCIO B2B</small></span>
      </Link>

      <nav className="order-3 flex w-full gap-1 overflow-x-auto rounded-full bg-[#f7f8f3] p-1 md:order-0 md:w-auto" aria-label={`Navegação de ${profileName}`}>
        {links.map((link, index) => {
          const Icon = navIcons[index] ?? LayoutDashboard
          const isRouteLink = link.href.startsWith('/')
          const decodedCurrentHash = decodeURIComponent(currentHash)
          const decodedTargetHash = decodeURIComponent(link.href)
          const isActive = isRouteLink
            ? location.pathname.replace(/\/$/, '') === link.href.replace(/\/$/, '')
            : decodedCurrentHash === decodedTargetHash || (!currentHash && index === 0)
          const className = `flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2.5 text-[13px] font-semibold transition-colors hover:bg-white hover:text-[#194e16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c] ${isActive ? 'bg-white text-[#194e16] shadow-[0_4px_16px_rgba(16,34,23,.05)]' : 'text-[#415247]'}`
          const contents = (
            <>
              <Icon size={15} strokeWidth={2} aria-hidden="true" />
              {link.label}
            </>
          )

          return isRouteLink ? (
            <Link
              className={className}
              to={link.href}
              key={link.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {contents}
            </Link>
          ) : (
            <a
              className={className}
              href={link.href}
              key={link.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {contents}
            </a>
          )
        })}
      </nav>

      <div className="flex items-center gap-3">
        <button className="relative grid size-10 cursor-pointer place-items-center rounded-full border border-transparent text-[#415247] transition-colors hover:bg-[#f7f8f3] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]" aria-label="Notificações">
          <Bell size={18} strokeWidth={2} />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#c1f23c]" />
        </button>
        <button className="flex cursor-pointer items-center gap-2 rounded-full bg-[#f0f4eb] py-1 pl-1.5 pr-3 transition-colors hover:bg-[#e3f3e8] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]">
          <span className="grid size-8.5 place-items-center rounded-full bg-[#2f681f] text-sm font-bold text-white">{profileName.charAt(0)}</span>
          <span className="hidden text-left sm:block">
            <strong className="block text-[13px] font-extrabold text-[#102217]">{profileName}</strong>
            <small className="block text-[10px] font-bold text-[#287a48]">{role ?? 'PERFIL'}</small>
          </span>
          <ChevronDown size={14} strokeWidth={2} />
        </button>
      </div>
    </header>
  )
}
