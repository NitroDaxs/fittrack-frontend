import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import type { Units } from '../../types/shared'
import FilterChips from './FilterChips'
import MultiSelect from './MultiSelect'
import SearchInput from './SearchInput'
import UnitToggle from './UnitToggle'
import { SelectField, TextAreaField, TextField } from './Field'

const options = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'legs', label: 'Legs' },
]

describe('SearchInput', () => {
  function Controlled({ onChange = () => {} }: { onChange?: (v: string) => void }) {
    const [value, setValue] = useState('')
    return (
      <SearchInput
        value={value}
        placeholder="Find"
        onChange={(next) => {
          setValue(next)
          onChange(next)
        }}
      />
    )
  }

  it('reports typed text and shows a clear button only when there is text', async () => {
    const onChange = vi.fn()
    render(<Controlled onChange={onChange} />)
    expect(screen.queryByRole('button', { name: i18n.t('ui.clearSearch') })).not.toBeInTheDocument()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Find' }), 'ab')
    expect(onChange).toHaveBeenLastCalledWith('ab')

    await userEvent.click(screen.getByRole('button', { name: i18n.t('ui.clearSearch') }))
    expect(onChange).toHaveBeenLastCalledWith('')
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })

  it('falls back to a default placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} />)
    expect(screen.getByPlaceholderText(i18n.t('ui.search'))).toBeInTheDocument()
  })
})

describe('FilterChips', () => {
  it('marks the active chip and "All" when nothing is selected', () => {
    const { rerender } = render(<FilterChips label="Muscle" options={options} value={null} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: i18n.t('common.all') })).toHaveAttribute('aria-pressed', 'true')
    rerender(<FilterChips label="Muscle" options={options} value="back" onChange={() => {}} allLabel="Any" />)
    expect(screen.getByRole('button', { name: 'Any' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Back' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('selects a chip, clears on re-click and on "All"', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<FilterChips label="Muscle" options={options} value={null} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Chest' }))
    expect(onChange).toHaveBeenLastCalledWith('chest')

    rerender(<FilterChips label="Muscle" options={options} value="chest" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Chest' }))
    expect(onChange).toHaveBeenLastCalledWith(null)
    await userEvent.click(screen.getByRole('button', { name: i18n.t('common.all') }))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })
})

describe('MultiSelect', () => {
  function Controlled({ initial = [] as string[] }) {
    const [value, setValue] = useState(initial)
    return <MultiSelect label="Muscles" placeholder="Any muscle" options={options} value={value} onChange={setValue} />
  }

  it('shows the placeholder, then a summary and count of the selection', async () => {
    render(<Controlled />)
    const trigger = screen.getByRole('button', { name: 'Muscles' })
    expect(trigger).toHaveTextContent('Any muscle')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Legs' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Chest' }))
    // Summary follows option order, not click order.
    expect(trigger).toHaveTextContent('Chest, Legs')
    expect(trigger).toHaveTextContent('2')
  })

  it('unchecks a selected option', async () => {
    render(<Controlled initial={['back']} />)
    await userEvent.click(screen.getByRole('button', { name: 'Muscles' }))
    const back = screen.getByRole('checkbox', { name: 'Back' })
    expect(back).toBeChecked()
    await userEvent.click(back)
    expect(back).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Muscles' })).toHaveTextContent('Any muscle')
  })

  it('closes on Escape and on an outside click', async () => {
    render(
      <>
        <Controlled />
        <p>elsewhere</p>
      </>,
    )
    const trigger = screen.getByRole('button', { name: 'Muscles' })
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()

    await userEvent.click(trigger)
    await userEvent.click(screen.getByText('elsewhere'))
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
})

describe('UnitToggle', () => {
  it('marks the current unit and reports changes', async () => {
    function Controlled() {
      const [unit, setUnit] = useState<Units>('imperial')
      return <UnitToggle unit={unit} onChange={setUnit} imperialLabel="lb" metricLabel="kg" />
    }
    render(<Controlled />)
    expect(screen.getByRole('group', { name: i18n.t('common.units') })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'lb' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'kg' }))
    expect(screen.getByRole('button', { name: 'kg' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'lb' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('has default labels', () => {
    render(<UnitToggle unit="metric" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: i18n.t('ui.lbsFtIn') })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: i18n.t('common.kgCm') })).toBeInTheDocument()
  })
})

describe('form fields', () => {
  it('TextField links its label, hint and error', () => {
    const { rerender } = render(<TextField id="email" label="Email" hint="We never share it" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAccessibleDescription('We never share it')
    expect(input).not.toHaveAttribute('aria-invalid')

    rerender(<TextField id="email" label="Email" hint="We never share it" error="Required" />)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Required')
    expect(screen.queryByText('We never share it')).not.toBeInTheDocument()
  })

  it('TextField falls back to the name for its id', () => {
    render(<TextField name="nickname" label="Nickname" />)
    expect(screen.getByLabelText('Nickname')).toHaveAttribute('id', 'nickname')
  })

  it('SelectField and TextAreaField show errors', () => {
    render(
      <>
        <SelectField id="goal" label="Goal" error="Pick one">
          <option value="">-</option>
        </SelectField>
        <TextAreaField id="bio" label="Bio" error="Too long" />
      </>,
    )
    expect(screen.getByLabelText('Goal')).toHaveAccessibleDescription('Pick one')
    expect(screen.getByLabelText('Bio')).toHaveAccessibleDescription('Too long')
    expect(screen.getByLabelText('Bio')).toHaveAttribute('aria-invalid', 'true')
  })
})
