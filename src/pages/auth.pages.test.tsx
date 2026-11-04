import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import i18n from '../i18n'
import { ApiError } from '../services/http'
import { renderWithProviders } from '../test/utils'
import ForgotPassword from './ForgotPassword'
import Login from './Login'
import ResetPassword from './ResetPassword'
import Signup from './Signup'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const auth = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn() }))
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../services/auth', () => ({ authService: { forgotPassword: vi.fn(), resetPassword: vi.fn() } }))

const { authService } = await import('../services/auth')
const t = (key: string, params?: Record<string, unknown>) => i18n.t(key, params)

function Where() {
  return <p>landed on {useLocation().pathname}</p>
}

const renderPage = (path: string, element: React.ReactNode, route: string | { pathname: string; state?: unknown } = path) =>
  renderWithProviders(
    <Routes>
      <Route path={path} element={element} />
      <Route path="*" element={<Where />} />
    </Routes>,
    { route },
  )

beforeEach(() => {
  auth.login.mockReset()
  auth.register.mockReset()
  vi.mocked(authService.forgotPassword).mockReset()
  vi.mocked(authService.resetPassword).mockReset()
  vi.mocked(toast.error).mockClear()
})

describe('Login', () => {
  const fill = async (email: string, password: string) => {
    if (email) await userEvent.type(screen.getByLabelText(t('common.emailAddress')), email)
    if (password) await userEvent.type(screen.getByLabelText(t('common.password')), password)
    await userEvent.click(screen.getByRole('button', { name: t('common.logIn') }))
  }

  it('validates before calling the API', async () => {
    renderPage('/login', <Login />)
    await fill('', '')
    expect(await screen.findByText(t('common.enterYourEmailAddress'))).toBeInTheDocument()
    expect(screen.getByText(t('login.enterYourPassword'))).toBeInTheDocument()
    expect(auth.login).not.toHaveBeenCalled()
  })

  it('logs in and goes to the dashboard', async () => {
    auth.login.mockResolvedValue({})
    renderPage('/login', <Login />)
    await fill('ada@example.com', 'x')
    expect(await screen.findByText('landed on /dashboard')).toBeInTheDocument()
    expect(auth.login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'x' })
  })

  it('returns to the page that required the login', async () => {
    auth.login.mockResolvedValue({})
    renderPage('/login', <Login />, { pathname: '/login', state: { from: '/workouts' } })
    await fill('ada@example.com', 'x')
    expect(await screen.findByText('landed on /workouts')).toBeInTheDocument()
  })

  it('shows a failed login as a toast and stays', async () => {
    auth.login.mockRejectedValue(new ApiError('These credentials do not match.', 401))
    renderPage('/login', <Login />)
    await fill('ada@example.com', 'bad')
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('These credentials do not match.'))
    expect(screen.getByRole('button', { name: t('common.logIn') })).toBeInTheDocument()
  })
})

describe('Signup', () => {
  it('rates the password as it is typed', async () => {
    renderPage('/signup', <Signup />)
    const password = screen.getByLabelText(t('common.password'))
    expect(password).toHaveAccessibleDescription(t('signup.mustBeAtLeast8Characters'))

    const strength = (key: string) => t('signup.passwordStrength', { value: t(key) })
    await userEvent.type(password, 'abc')
    expect(screen.getByText(strength('signup.tooShort'))).toBeInTheDocument()
    await userEvent.type(password, 'defgh')
    expect(screen.getByText(strength('signup.weak'))).toBeInTheDocument()
    await userEvent.type(password, '1')
    expect(screen.getByText(strength('signup.fair'))).toBeInTheDocument()
    await userEvent.type(password, 'A')
    expect(screen.getByText(strength('signup.good'))).toBeInTheDocument()
    await userEvent.type(password, '!')
    expect(screen.getByText(strength('signup.strong'))).toBeInTheDocument()
  })

  it('creates the account and goes to the dashboard', async () => {
    auth.register.mockResolvedValue({})
    renderPage('/signup', <Signup />)
    await userEvent.type(screen.getByLabelText(t('signup.fullName')), 'Ada Lovelace')
    await userEvent.type(screen.getByLabelText(t('common.emailAddress')), 'ada@example.com')
    await userEvent.type(screen.getByLabelText(t('common.password')), 'Password1')
    await userEvent.type(screen.getByLabelText(t('signup.confirmPassword')), 'Password1')
    await userEvent.click(screen.getByRole('button', { name: t('signup.createAccount') }))
    expect(await screen.findByText('landed on /dashboard')).toBeInTheDocument()
    // The confirmation is not sent.
    expect(auth.register).toHaveBeenCalledWith({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'Password1' })
  })

  it('reports a mismatched confirmation', async () => {
    renderPage('/signup', <Signup />)
    await userEvent.type(screen.getByLabelText(t('signup.fullName')), 'Ada')
    await userEvent.type(screen.getByLabelText(t('common.emailAddress')), 'ada@example.com')
    await userEvent.type(screen.getByLabelText(t('common.password')), 'Password1')
    await userEvent.type(screen.getByLabelText(t('signup.confirmPassword')), 'Password2')
    await userEvent.click(screen.getByRole('button', { name: t('signup.createAccount') }))
    expect(await screen.findByText(t('common.passwordsDoNotMatch'))).toBeInTheDocument()
    expect(auth.register).not.toHaveBeenCalled()
  })

  it('shows a server error as a toast', async () => {
    auth.register.mockRejectedValue(new ApiError('The email has already been taken.', 422))
    renderPage('/signup', <Signup />)
    await userEvent.type(screen.getByLabelText(t('signup.fullName')), 'Ada')
    await userEvent.type(screen.getByLabelText(t('common.emailAddress')), 'ada@example.com')
    await userEvent.type(screen.getByLabelText(t('common.password')), 'Password1')
    await userEvent.type(screen.getByLabelText(t('signup.confirmPassword')), 'Password1')
    await userEvent.click(screen.getByRole('button', { name: t('signup.createAccount') }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('The email has already been taken.'))
  })
})

describe('ForgotPassword', () => {
  it('sends the link and confirms where it went, with a way to try again', async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValue({ message: 'sent' })
    renderPage('/forgot-password', <ForgotPassword />)
    await userEvent.type(screen.getByLabelText(t('common.emailAddress')), 'ada@example.com')
    await userEvent.click(screen.getByRole('button', { name: t('forgotPassword.sendResetLink') }))

    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent(t('forgotPassword.checkYourEmail'))
    expect(status).toHaveTextContent('ada@example.com')
    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'ada@example.com' })

    await userEvent.click(screen.getByRole('button', { name: t('forgotPassword.tryAgain') }))
    expect(screen.getByRole('button', { name: t('forgotPassword.sendResetLink') })).toBeInTheDocument()
  })

  it('validates the email', async () => {
    renderPage('/forgot-password', <ForgotPassword />)
    await userEvent.type(screen.getByLabelText(t('common.emailAddress')), 'nope')
    await userEvent.click(screen.getByRole('button', { name: t('forgotPassword.sendResetLink') }))
    expect(await screen.findByText(t('admin.users.enterAValidEmailAddress'))).toBeInTheDocument()
    expect(authService.forgotPassword).not.toHaveBeenCalled()
  })

  it('shows a failure as a toast', async () => {
    vi.mocked(authService.forgotPassword).mockRejectedValue(new Error('Too many attempts'))
    renderPage('/forgot-password', <ForgotPassword />)
    await userEvent.type(screen.getByLabelText(t('common.emailAddress')), 'ada@example.com')
    await userEvent.click(screen.getByRole('button', { name: t('forgotPassword.sendResetLink') }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Too many attempts'))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})

describe('ResetPassword', () => {
  const submit = async (password = 'NewPass12', confirm = password) => {
    await userEvent.type(screen.getByLabelText(t('resetPassword.newPassword')), password)
    await userEvent.type(screen.getByLabelText(t('resetPassword.confirmNewPassword')), confirm)
    await userEvent.click(screen.getByRole('button', { name: t('resetPassword.updatePassword') }))
  }

  it('says the link is broken when it has no token', () => {
    renderPage('/reset-password', <ResetPassword />)
    expect(screen.getByRole('status')).toHaveTextContent(t('resetPassword.thisLinkDoesnTWork'))
    expect(screen.getByRole('link', { name: t('resetPassword.requestANewLink') })).toHaveAttribute('href', '/forgot-password')
  })

  it('resets the password with the token from the link', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue({ message: 'ok' })
    renderPage('/reset-password', <ResetPassword />, '/reset-password?token=abc')
    await submit()
    expect(await screen.findByRole('status')).toHaveTextContent(t('resetPassword.passwordUpdated'))
    expect(authService.resetPassword).toHaveBeenCalledWith({ token: 'abc', password: 'NewPass12', password_confirmation: 'NewPass12' })
    expect(screen.getByRole('link', { name: t('common.logIn') })).toHaveAttribute('href', '/login')
  })

  it('shows the broken-link screen for an expired token', async () => {
    vi.mocked(authService.resetPassword).mockRejectedValue(new ApiError('Invalid', 422, { token: 'This token is invalid.' }))
    renderPage('/reset-password', <ResetPassword />, '/reset-password?token=old')
    await submit()
    expect(await screen.findByRole('status')).toHaveTextContent(t('resetPassword.thisLinkDoesnTWork'))
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('shows other failures as a toast', async () => {
    vi.mocked(authService.resetPassword).mockRejectedValue(new ApiError('Server error', 500))
    renderPage('/reset-password', <ResetPassword />, '/reset-password?token=abc')
    await submit()
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Server error'))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('validates the new password', async () => {
    renderPage('/reset-password', <ResetPassword />, '/reset-password?token=abc')
    await submit('newpass12')
    expect(await screen.findByText(t('validation.passwordUppercase'))).toBeInTheDocument()
    expect(authService.resetPassword).not.toHaveBeenCalled()
  })
})
