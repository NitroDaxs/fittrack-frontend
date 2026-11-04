import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import Avatar from './Avatar'
import DataTable, { RowActions, type Column } from './DataTable'
import Img from './Img'
import LanguageSwitcher from './LanguageSwitcher'
import Modal from './Modal'
import { EmptyState, ErrorState, Spinner } from './States'
import VideoEmbed from './VideoEmbed'
import type { Sort } from '../../hooks/useCrud'

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(<Modal open={false} title="Edit" onClose={() => {}}>body</Modal>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the title, description, body and footer in a dialog', () => {
    render(
      <Modal open title="Edit" description="Change things" onClose={() => {}} footer={<button>Save</button>}>
        <input aria-label="Name" />
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Edit' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText('Change things')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('focuses the first field and locks page scroll while open', () => {
    const { rerender } = render(
      <Modal open title="Edit" onClose={() => {}}>
        <input aria-label="Name" />
      </Modal>,
    )
    // The close button comes first in the panel.
    expect(screen.getByRole('button', { name: i18n.t('ui.closeDialog') })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')
    rerender(<Modal open={false} title="Edit" onClose={() => {}}>x</Modal>)
    expect(document.body.style.overflow).toBe('')
  })

  it('closes on Escape, the close button and the backdrop', async () => {
    const onClose = vi.fn()
    const { baseElement } = render(<Modal open title="Edit" onClose={onClose}>body</Modal>)
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: i18n.t('ui.closeDialog') }))
    fireEvent.click(baseElement.querySelector('.backdrop-blur-\\[2px\\]')!)
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('does not steal focus back while the user types', async () => {
    function Editor() {
      const [value, setValue] = useState('')
      return (
        <Modal open title="Edit" onClose={() => setValue('')}>
          <input aria-label="First" />
          <input aria-label="Second" value={value} onChange={(e) => setValue(e.target.value)} />
        </Modal>
      )
    }
    render(<Editor />)
    await userEvent.click(screen.getByLabelText('Second'))
    await userEvent.type(screen.getByLabelText('Second'), 'abc')
    expect(screen.getByLabelText('Second')).toHaveFocus()
    expect(screen.getByLabelText('Second')).toHaveValue('abc')
  })
})

describe('DataTable', () => {
  interface Row {
    id: number
    name: string
  }
  const columns: Column<Row>[] = [
    { key: 'name', header: 'Name', sortable: true, render: (row) => row.name },
    { key: 'id', header: 'ID', render: (row) => `#${row.id}` },
  ]

  it('renders rows through the column renderers', () => {
    render(<DataTable columns={columns} rows={[{ id: 1, name: 'Ada' }, { id: 2, name: 'Bo' }]} />)
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getByRole('cell', { name: '#2' })).toBeInTheDocument()
  })

  it('shows an empty message', () => {
    const { rerender } = render(<DataTable columns={columns} rows={[]} />)
    expect(screen.getByText(i18n.t('ui.nothingToShow'))).toBeInTheDocument()
    rerender(<DataTable columns={columns} rows={[]} empty="No users" />)
    expect(screen.getByText('No users')).toBeInTheDocument()
  })

  it('sorts ascending first, then toggles direction', async () => {
    function Sortable() {
      const [sort, setSort] = useState<Sort | null>(null)
      return <DataTable columns={columns} rows={[]} sort={sort} onSortChange={setSort} />
    }
    render(<Sortable />)
    const header = screen.getByRole('columnheader', { name: 'Name' })
    expect(header).toHaveAttribute('aria-sort', 'none')
    await userEvent.click(screen.getByRole('button', { name: 'Name' }))
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    await userEvent.click(screen.getByRole('button', { name: 'Name' }))
    expect(header).toHaveAttribute('aria-sort', 'descending')
    // Non-sortable columns have no button.
    expect(screen.queryByRole('button', { name: 'ID' })).not.toBeInTheDocument()
  })

  it('switching to another column starts ascending', async () => {
    const onSortChange = vi.fn()
    render(
      <DataTable
        columns={[...columns, { key: 'email', header: 'Email', sortable: true, render: () => '' }]}
        rows={[]}
        sort={{ key: 'name', dir: 'desc' }}
        onSortChange={onSortChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Email' }))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'email', dir: 'asc' })
  })

  it('RowActions calls edit and delete', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<RowActions onEdit={onEdit} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: i18n.t('ui.edit') }))
    await userEvent.click(screen.getByRole('button', { name: i18n.t('common.delete') }))
    expect(onEdit).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledOnce()
  })
})

describe('States', () => {
  it('Spinner announces loading', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveTextContent(i18n.t('ui.loading'))
  })

  it('EmptyState shows its content', () => {
    render(<EmptyState title="Nothing" body="Try again" action={<button>Reset</button>} />)
    expect(screen.getByRole('heading', { name: 'Nothing' })).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('ErrorState shows the error and retries', async () => {
    const onRetry = vi.fn()
    render(<ErrorState error={new Error('Server down')} onRetry={onRetry} />)
    expect(screen.getByText('Server down')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: i18n.t('ui.tryAgain') }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('ErrorState without details uses a default message and no retry button', () => {
    render(<ErrorState />)
    expect(screen.getByText(i18n.t('ui.theRequestCouldNotBeCompleted'))).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('images', () => {
  it('Img falls back to an icon tile when missing or broken', () => {
    const { rerender } = render(<Img src={null} alt="Squat" />)
    expect(screen.getByRole('img', { name: 'Squat' }).tagName).toBe('DIV')

    rerender(<Img key="b" src="https://x/a.png" alt="Bench" />)
    const img = screen.getByRole('img', { name: 'Bench' })
    expect(img.tagName).toBe('IMG')
    fireEvent.error(img)
    expect(screen.getByRole('img', { name: 'Bench' }).tagName).toBe('DIV')
  })

  it('Avatar shows the picture, and the icon when it fails', () => {
    const { container, rerender } = render(<Avatar url="https://x/me.png" />)
    const img = container.querySelector('img')!
    expect(img).toHaveAttribute('src', 'https://x/me.png')
    fireEvent.error(img)
    expect(container.querySelector('img')).toBeNull()
    // A new URL gets another chance.
    rerender(<Avatar url="https://x/new.png" />)
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://x/new.png')
  })

  it('VideoEmbed plays only after a click', async () => {
    const { container } = render(<VideoEmbed videoId="dQw4w9WgXcQ" poster="p.jpg" title="Squat" />)
    expect(container.querySelector('iframe')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: i18n.t('ui.playDemonstration', { title: 'Squat' }) }))
    const iframe = container.querySelector('iframe')!
    expect(iframe.src).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0')
    expect(iframe).toHaveAttribute('title', i18n.t('ui.demonstration', { title: 'Squat' }))
  })

  it('VideoEmbed without a video has no play button', () => {
    render(<VideoEmbed videoId={null} poster="p.jpg" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('LanguageSwitcher', () => {
  afterEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('switches the app language', async () => {
    render(<LanguageSwitcher />)
    const trigger = screen.getByRole('button', { name: `${i18n.t('common.language')}: English` })
    await userEvent.click(trigger)
    expect(screen.getByRole('button', { name: /English/ , pressed: true })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Български' }))
    expect(i18n.resolvedLanguage).toBe('bg')
    expect(screen.queryByRole('button', { name: 'Български' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { expanded: false })).toHaveFocus()
  })
})
