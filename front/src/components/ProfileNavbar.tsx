import logoImage from '../assets/logo.svg'
import {
  Bell,
  ChevronDown,
  Handshake,
  LayoutDashboard,
  PackageCheck,
  Store,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

type ProfileNavLink = { label: string; href: string }

type ProfileNavbarProps = {
  profileName: string
  role?: string
  links: ProfileNavLink[]
  notificationCount?: number
  notificationsHref?: string
}

export default function ProfileNavbar({ profileName: fallbackName, role, links, notificationCount = 0, notificationsHref }: ProfileNavbarProps) {
  // Nome real do usuário logado; a prop só serve de fallback.
  const profileName = useAuthStore((state) => state.user?.name) ?? fallbackName
  const navIcons: LucideIcon[] = [LayoutDashboard, Store, Handshake, PackageCheck]
  const location = useLocation()
  const navigate = useNavigate()
  const authProfile = useAuthStore((state) => state.profile)
  const currentHash = location.hash
  const notificationsPath = notificationsHref?.replace(/\/$/, '')
  const isNotificationsActive = notificationsPath === location.pathname.replace(/\/$/, '')
  const notificationClassName = `relative flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2.5 text-[13px] font-semibold transition-colors hover:bg-white hover:text-[#194e16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c] ${isNotificationsActive ? 'bg-white text-[#194e16] shadow-[0_4px_16px_rgba(16,34,23,.05)]' : 'text-[#415247]'}`
  const notificationContents = (
    <span className="relative">
      <Bell size={15} strokeWidth={2} aria-hidden="true" />
      {notificationCount > 0 && (
        <span className="absolute -right-2 -top-2 flex min-w-[16px] items-center justify-center rounded-full bg-[#c1f23c] px-1 text-[9px] font-extrabold leading-4 text-[#102217]">
          {notificationCount > 99 ? '99+' : notificationCount}
        </span>
      )}
    </span>
  )
  const allLinks = notificationsHref
    ? [...links, { label: 'Notificações', href: notificationsHref }]
    : links
  const activeLink = allLinks.find((link) => {
    if (link.href.startsWith('#')) return currentHash === link.href
    return location.pathname.replace(/\/$/, '') === link.href.replace(/\/$/, '')
  }) ?? allLinks[0]
  const profilePath = `/${authProfile ?? 'comprador'}/perfil`

  return (
    <header className="grid min-h-[76px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 border-b border-[#dde3da] bg-white px-4 py-3 sm:px-5 sm:py-4 md:h-19 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4 md:px-12 md:py-4">
      <Link className="col-start-1 row-start-1 flex min-w-0 items-center gap-2.5 justify-self-start text-[#15371e] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]" to="/" aria-label="Solum início">
        <span className="grid size-9 place-items-center rounded-lg"><img src={logoImage} alt="" className="size-9" /></span>
        <span className="min-w-0"><strong className="block font-sans text-lg font-extrabold leading-none text-[#194e16] sm:text-xl">SOLUM</strong><small className="mt-1 hidden text-[9px] font-bold text-[#708077] sm:block">AGRONEGÓCIO B2B</small></span>
      </Link>

      <nav className="col-span-2 col-start-1 row-start-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1 md:w-auto" aria-label={`Navegação de ${profileName}`}>
        <label className="relative block md:hidden">
          <span className="sr-only">Selecionar navegação</span>
          <select
            value={activeLink.href}
            onChange={(event) => navigate(event.target.value)}
            className="w-full appearance-none rounded-full border border-[#e1e7dd] bg-[#f7f8f3] px-4 py-3 pr-10 text-sm font-bold text-[#194e16] outline-none focus:border-[#9dcc2f] focus:ring-2 focus:ring-[#c1f23c]/40"
          >
            {allLinks.map((link) => (
              <option key={link.href} value={link.href}>{link.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#194e16]" size={16} aria-hidden="true" />
        </label>

        <div className="hidden min-w-0 gap-1 overflow-x-auto rounded-full bg-[#f7f8f3] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex">
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

        {notificationsHref ? (
          <Link
            to={notificationsHref}
            className={notificationClassName}
            aria-label={`Notificações${notificationCount > 0 ? `: ${notificationCount} não lidas` : ''}`}
            aria-current={isNotificationsActive ? 'page' : undefined}
          >
            {notificationContents}
          </Link>
        ) : (
          <button
            type="button"
            className={notificationClassName}
            aria-label={`Notificações${notificationCount > 0 ? `: ${notificationCount} não lidas` : ''}`}
          >
            {notificationContents}
          </button>
        )}
        </div>
      </nav>

      <div className="col-start-2 row-start-1 min-w-0 justify-self-end md:col-start-3">
        <Link
          to={profilePath}
          className="flex min-w-[4.5rem] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-transparent py-1 pl-1.5 pr-2 transition-colors hover:bg-[#e3f3e8] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c] md:bg-[#f0f4eb] md:hover:bg-[#e3f3e8] sm:pr-3"
          aria-label={`Perfil de ${profileName}`}
        >
          <span className="grid size-8.5 shrink-0 place-items-center rounded-full bg-[#2f681f] text-sm font-bold text-white">{profileName.charAt(0)}</span>
          <span className="hidden min-w-0 text-left sm:block">
            <strong className="block max-w-[clamp(7rem,18vw,14rem)] truncate text-[13px] font-extrabold text-[#102217]">{profileName}</strong>
            <small className="block text-[10px] font-bold text-[#287a48]">{role ?? 'PERFIL'}</small>
          </span>
        </Link>
      </div>
    </header>
  )
}
