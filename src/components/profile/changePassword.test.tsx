import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import i18n from '../../i18n'
import { userDto } from '../../test/fixtures'
import { renderWithProviders } from '../../test/utils'
import ChangePasswordForm from './ChangePasswordForm'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../../services/me', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/me')>()),
  meService: { changePassword: vi.fn() },
}))

const { meService } = await import('../../services/me')
const t = (key: string) => i18n.t(key)

const fields = () => ({
  current: screen.getByLabelText(t('profileSettings.currentPassword')),
  next: screen.getByLabelText(t('profileSettings.newPassword')),
  confirm: screen.getByLabelText(t('profileSettings.confirmNewPassword')),
  submit: screen.getByRole('button', { name: t('profileSettings.updatePassword') }),
})

beforeEach(() => {
  vi.mocked(meService.changePassword).mockReset().mockResolvedValue({ user: userDto(), access_token: 'new', token_type: 'Bearer' })
  vi.mocked(toast.success).mockClear()
})

describe('ChangePasswordForm', () => {
  it('shows the password rules as a hint', () => {
    renderWithProviders(<ChangePasswordForm />)
    expect(fields().next).toHaveAccessibleDescription(t('profileSettings.errors.passwordRules'))
  })

  it('validates before sending anything', async () => {
    renderWithProviders(<ChangePasswordForm />)
    await userEvent.click(fields().submit)
    expect(await screen.findByText(t('profileSettings.errors.currentPasswordRequired'))).toBeInTheDocument()
    expect(screen.getByText(t('resetPassword.chooseANewPassword2'))).toBeInTheDocument()
    expect(screen.getByText(t('resetPassword.confirmYourNewPassword'))).toBeInTheDocument()
    expect(meService.changePassword).not.toHaveBeenCalled()
  })

  it('validates a field when it loses focus', async () => {
    renderWithProviders(<ChangePasswordForm />)
    await userEvent.type(fields().next, 'short')
    await userEvent.tab()
    expect(await screen.findByText(t('common.mustBeAtLeast8Characters'))).toBeInTheDocument()
  })

  it('rejects reusing the current password and a mismatched confirmation', async () => {
    renderWithProviders(<ChangePasswordForm />)
    const { current, next, confirm, submit } = fields()
    await userEvent.type(current, 'Same1234')
    await userEvent.type(next, 'Same1234')
    await userEvent.type(confirm, 'Other1234')
    await userEvent.click(submit)
    expect(await screen.findByText(t('profileSettings.errors.passwordSame'))).toBeInTheDocument()
    expect(screen.getByText(t('profileSettings.errors.passwordMismatch'))).toBeInTheDocument()
    expect(meService.changePassword).not.toHaveBeenCalled()
  })

  it('sends a valid change, then clears the form and confirms', async () => {
    renderWithProviders(<ChangePasswordForm />)
    const { current, next, confirm, submit } = fields()
    await userEvent.type(current, 'OldPass1')
    await userEvent.type(next, 'NewPass12')
    await userEvent.type(confirm, 'NewPass12')
    await userEvent.click(submit)

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(t('profileSettings.passwordChanged')))
    expect(vi.mocked(meService.changePassword).mock.calls[0][0]).toEqual({
      current_password: 'OldPass1',
      new_password: 'NewPass12',
      new_password_confirmation: 'NewPass12',
    })
    expect(current).toHaveValue('')
    expect(next).toHaveValue('')
    expect(confirm).toHaveValue('')
  })

  it('keeps the values when the server rejects the change', async () => {
    vi.mocked(meService.changePassword).mockRejectedValue(new Error('Wrong password'))
    renderWithProviders(<ChangePasswordForm />)
    const { current, next, confirm, submit } = fields()
    await userEvent.type(current, 'Wrong123')
    await userEvent.type(next, 'NewPass12')
    await userEvent.type(confirm, 'NewPass12')
    await userEvent.click(submit)
    await waitFor(() => expect(meService.changePassword).toHaveBeenCalled())
    await waitFor(() => expect(submit).toBeEnabled())
    expect(current).toHaveValue('Wrong123')
    expect(toast.success).not.toHaveBeenCalled()
  })
})
