import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import i18n from '../../i18n'
import { userDto } from '../../test/fixtures'
import { renderWithProviders } from '../../test/utils'
import EditProfileForm from './EditProfileForm'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../../services/me', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../services/me')>()),
  meService: { updateProfile: vi.fn() },
}))

const { meService, toProfile } = await import('../../services/me')
const t = (key: string) => i18n.t(key)
const profile = toProfile(userDto({ name: 'Ada', email: 'ada@example.com' }))

const passwordLabel = () => t('profileSettings.currentPassword')

beforeEach(() => {
  vi.mocked(meService.updateProfile).mockReset().mockResolvedValue(userDto())
  vi.mocked(toast.success).mockClear()
})

describe('EditProfileForm', () => {
  it('starts with the current details and no password box', () => {
    renderWithProviders(<EditProfileForm profile={profile} />)
    expect(screen.getByLabelText(t('common.name'))).toHaveValue('Ada')
    expect(screen.getByLabelText(t('common.email'))).toHaveValue('ada@example.com')
    expect(screen.queryByLabelText(passwordLabel())).not.toBeInTheDocument()
  })

  it('saves a name change without a password', async () => {
    renderWithProviders(<EditProfileForm profile={profile} />)
    const name = screen.getByLabelText(t('common.name'))
    await userEvent.clear(name)
    await userEvent.type(name, 'Ada L.')
    await userEvent.click(screen.getByRole('button', { name: t('profileSettings.saveChanges') }))
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(t('profileSettings.detailsSaved')))
    expect(vi.mocked(meService.updateProfile).mock.calls[0][0]).toEqual({
      name: 'Ada L.',
      email: 'ada@example.com',
      current_password: undefined,
    })
  })

  it('asks for the password once the email changes, and requires it', async () => {
    renderWithProviders(<EditProfileForm profile={profile} />)
    const email = screen.getByLabelText(t('common.email'))
    await userEvent.clear(email)
    await userEvent.type(email, 'New@Example.com')
    const password = screen.getByLabelText(passwordLabel())
    expect(password).toHaveAccessibleDescription(t('profileSettings.emailPasswordHint'))

    await userEvent.click(screen.getByRole('button', { name: t('profileSettings.saveChanges') }))
    expect(await screen.findByText(t('profileSettings.errors.currentPasswordRequired'))).toBeInTheDocument()
    expect(meService.updateProfile).not.toHaveBeenCalled()

    await userEvent.type(password, 'secret')
    await userEvent.click(screen.getByRole('button', { name: t('profileSettings.saveChanges') }))
    await waitFor(() => expect(meService.updateProfile).toHaveBeenCalled())
    expect(vi.mocked(meService.updateProfile).mock.calls[0][0]).toEqual({
      name: 'Ada',
      email: 'new@example.com',
      current_password: 'secret',
    })
  })

  it('treats a case-only email change as unchanged', async () => {
    renderWithProviders(<EditProfileForm profile={profile} />)
    const email = screen.getByLabelText(t('common.email'))
    await userEvent.clear(email)
    await userEvent.type(email, 'ADA@example.com')
    expect(screen.queryByLabelText(passwordLabel())).not.toBeInTheDocument()
  })

  it('requires a name', async () => {
    renderWithProviders(<EditProfileForm profile={profile} />)
    await userEvent.clear(screen.getByLabelText(t('common.name')))
    await userEvent.click(screen.getByRole('button', { name: t('profileSettings.saveChanges') }))
    expect(await screen.findByText(t('profileSettings.errors.nameRequired'))).toBeInTheDocument()
  })
})
