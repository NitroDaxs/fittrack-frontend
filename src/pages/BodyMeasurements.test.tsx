import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import { useUnitStore } from '../store/unit.store'
import { renderWithProviders } from '../test/utils'
import type { Measurement } from '../types/me'
import BodyMeasurements from './BodyMeasurements'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: false }) }))

// Recharts needs real layout; record what the page hands the chart instead.
const chart = vi.hoisted(() => ({ data: [] as unknown[] }))
vi.mock('../components/charts/MeasurementChart', () => ({
  default: ({ data }: { data: unknown[] }) => {
    chart.data = data
    return <div data-testid="chart" />
  },
}))

vi.mock('../services/me', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/me')>()),
  meService: { measurements: vi.fn(), logMeasurement: vi.fn() },
}))

const { meService } = await import('../services/me')
const t = (key: string, params?: Record<string, unknown>) => i18n.t(key, params)

const entry = (overrides: Partial<Measurement>): Measurement => ({
  id: 1,
  date: '2024-05-10',
  weight: 180,
  bodyFat: null,
  waist: null,
  chest: null,
  arms: null,
  ...overrides,
})

// Newest first, as the API returns them.
const history = [
  entry({ id: 2, date: '2024-05-10', weight: 178.5, bodyFat: 15, chest: 41, waist: 32 }),
  entry({ id: 1, date: '2024-05-01', weight: 180, bodyFat: 16, chest: 40, waist: 32 }),
]

const renderPage = () => renderWithProviders(<BodyMeasurements />)

beforeEach(() => {
  vi.mocked(meService.measurements).mockReset().mockResolvedValue(history)
  vi.mocked(meService.logMeasurement).mockReset().mockResolvedValue(entry({ id: 3 }))
  chart.data = []
})

describe('BodyMeasurements', () => {
  it('shows a spinner, then the history with change since the previous entry', async () => {
    renderPage()
    expect(screen.getByRole('status')).toHaveTextContent(t('bodyMeasurements.loadingMeasurements'))

    const list = await screen.findByRole('list')
    const [latest, first] = within(list).getAllByRole('listitem')
    expect(latest).toHaveTextContent('178.5 lbs')
    expect(latest).toHaveTextContent('15% BF')
    expect(latest).toHaveTextContent('-1.5') // weight
    expect(latest).toHaveTextContent('+1') // chest
    expect(latest).toHaveTextContent('0') // waist unchanged
    expect(first).toHaveTextContent('—')
  })

  it('charts oldest to newest', async () => {
    renderPage()
    await screen.findByRole('list')
    expect(chart.data).toEqual([
      { date: '2024-05-01', weight: 180, bodyFat: 16 },
      { date: '2024-05-10', weight: 178.5, bodyFat: 15 },
    ])
  })

  it('shows an error with a retry', async () => {
    vi.mocked(meService.measurements).mockRejectedValueOnce(new Error('Server down'))
    renderPage()
    expect(await screen.findByText('Server down')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: t('ui.tryAgain') }))
    expect(await screen.findByRole('list')).toBeInTheDocument()
  })

  it('logs an imperial entry as typed and clears the form', async () => {
    renderPage()
    await screen.findByRole('list')
    const weight = screen.getByLabelText(`${t('bodyMeasurements.weight')} (lbs)`)
    await userEvent.type(weight, '177')
    await userEvent.type(screen.getByLabelText(`${t('bodyMeasurements.waist')} (in)`), '31.5')
    await userEvent.click(screen.getByRole('button', { name: t('bodyMeasurements.saveEntry') }))

    await waitFor(() => expect(weight).toHaveValue(null))
    expect(vi.mocked(meService.logMeasurement).mock.calls[0][0]).toEqual({
      weight: 177,
      bodyFat: null,
      waist: 31.5,
      chest: null,
      arms: null,
    })
  })

  it('converts metric input to the stored imperial units', async () => {
    useUnitStore.setState({ unit: 'metric' })
    renderPage()
    await screen.findByRole('list')
    // History is shown converted too.
    expect(screen.getByText(`${Number((178.5 * 0.453592).toFixed(1))} kg`)).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText(`${t('bodyMeasurements.weight')} (kg)`), '80')
    await userEvent.type(screen.getByLabelText(t('bodyMeasurements.bodyFat')), '18')
    await userEvent.type(screen.getByLabelText(`${t('bodyMeasurements.chest')} (cm)`), '100')
    await userEvent.click(screen.getByRole('button', { name: t('bodyMeasurements.saveEntry') }))

    await waitFor(() => expect(meService.logMeasurement).toHaveBeenCalled())
    expect(vi.mocked(meService.logMeasurement).mock.calls[0][0]).toEqual({
      weight: 176.4,
      bodyFat: 18,
      waist: null,
      chest: 39.4,
      arms: null,
    })
  })

  it('validates before saving', async () => {
    renderPage()
    await screen.findByRole('list')
    await userEvent.type(screen.getByLabelText(t('bodyMeasurements.bodyFat')), '90')
    await userEvent.click(screen.getByRole('button', { name: t('bodyMeasurements.saveEntry') }))
    expect(await screen.findByText(t('bodyMeasurements.weightIsRequired'))).toBeInTheDocument()
    expect(screen.getByText(t('bodyMeasurements.bodyFatShouldBeBetween0'))).toBeInTheDocument()
    expect(meService.logMeasurement).not.toHaveBeenCalled()
  })
})
