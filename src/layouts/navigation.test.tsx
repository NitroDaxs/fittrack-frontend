import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import { userDto } from '../test/fixtures'
import { renderWithProviders } from '../test/utils'
import BottomNav from './BottomNav'
import ProfileMenu from './ProfileMenu'
import PublicLayout from './PublicLayout'
import TopNav from './TopNav'

const auth = vi.hoisted(() => ({
  isAuthenticated: false,
  isMember: false,
  isAdmin: false,
  user: null as null | { name: string; email: string },
  logout: vi.fn(),
}))
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../services/me', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/me')>()),
  meService: { profile: vi.fn() },
}))

const { meService, toProfile } = await import('../services/me')
const t = (key: string, params?: Record<string, unknown>) => i18n.t(key, params)

const signIn = (admin = false) =>
  Object.assign(auth, { isAuthenticated: true, isMember: true, isAdmin: admin, user: { name: 'Ada', email: 'ada@example.com' } })

beforeEach(() => {
  Object.assign(auth, { isAuthenticated: false, isMember: false, isAdmin: false, user: null })
  auth.logout.mockReset()
  vi.mocked(meService.profile).mockReset().mockResolvedValue(toProfile(userDto({ name: 'Ada Lovelace', email: 'ada@example.com' })))
})

const hrefs = (container: HTMLElement) => within(container).getAllByRole('link').map((link) => link.getAttribute('href'))

describe('TopNav', () => {
  it('shows guests the public pages, log in and sign up', () => {
    renderWithProviders(<TopNav />)
    expect(screen.getAllByRole('link', { name: t('common.library') })[0]).toHaveAttribute('href', '/library')
    expect(screen.queryByRole('link', { name: t('nav.dashboard') })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: t('nav.login') })[0]).toHaveAttribute('href', '/login')
    expect(screen.getAllByRole('link', { name: t('nav.signUpFree') })[0]).toHaveAttribute('href', '/signup')
    expect(screen.queryByRole('button', { name: t('nav.accountMenu') })).not.toBeInTheDocument()
  })

  it('adds the member pages and account menu once signed in', () => {
    signIn()
    renderWithProviders(<TopNav />)
    for (const [label, href] of [['nav.dashboard', '/dashboard'], ['nav.history', '/history'], ['nav.measurements', '/measurements']]) {
      expect(screen.getAllByRole('link', { name: t(label) })[0]).toHaveAttribute('href', href)
    }
    expect(screen.queryByRole('link', { name: t('nav.login') })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: t('nav.accountMenu') })).toBeInTheDocument()
  })
})

describe('BottomNav', () => {
  it('switches its tabs for members', () => {
    const guest = renderWithProviders(<BottomNav />)
    expect(hrefs(guest.container)).toEqual(['/library', '/routines', '/calculators', '/articles'])
    guest.unmount()

    signIn()
    const member = renderWithProviders(<BottomNav />)
    expect(hrefs(member.container)).toEqual(['/dashboard', '/history', '/measurements', '/profile'])
  })
})

describe('ProfileMenu', () => {
  function Where() {
    return <p>landed on {useLocation().pathname}</p>
  }
  const renderMenu = () =>
    renderWithProviders(
      <>
        <ProfileMenu />
        <Routes>
          <Route path="*" element={<Where />} />
        </Routes>
      </>,
      { route: '/dashboard' },
    )

  it('shows the profile and links for a member', async () => {
    signIn()
    renderMenu()
    await userEvent.click(screen.getByRole('button', { name: t('nav.accountMenu') }))
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: t('nav.profileSettings') })).toHaveAttribute('href', '/profile')
    expect(screen.queryByRole('link', { name: t('nav.adminConsole') })).not.toBeInTheDocument()
  })

  it('links admins to the console', async () => {
    signIn(true)
    renderMenu()
    await userEvent.click(screen.getByRole('button', { name: t('nav.accountMenu') }))
    expect(screen.getByRole('link', { name: t('nav.adminConsole') })).toHaveAttribute('href', '/admin')
  })

  it('logs out and goes home', async () => {
    signIn()
    renderMenu()
    await userEvent.click(screen.getByRole('button', { name: t('nav.accountMenu') }))
    await userEvent.click(screen.getByRole('button', { name: t('common.logOut') }))
    expect(auth.logout).toHaveBeenCalledOnce()
    expect(screen.getByText('landed on /')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: t('nav.profileSettings') })).not.toBeInTheDocument()
  })
})

describe('PublicLayout', () => {
  const renderLayout = () =>
    renderWithProviders(
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<p>page content</p>} />
        </Route>
      </Routes>,
    )

  it('renders the page inside the navigation', () => {
    renderLayout()
    expect(screen.getByText('page content')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: t('chat.open') })).not.toBeInTheDocument()
  })

  it('offers the assistant to signed-in users', () => {
    signIn()
    renderLayout()
    expect(screen.getByRole('button', { name: t('chat.open') })).toBeInTheDocument()
  })
})
