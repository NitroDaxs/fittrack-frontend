import { fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useDismiss } from './useDismiss'

function Popup({ open, close }: { open: boolean; close: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useDismiss(open, close, root, trigger)
  return (
    <>
      <button ref={trigger}>trigger</button>
      <div ref={root}>
        <span>inside</span>
      </div>
      <span>outside</span>
    </>
  )
}

describe('useDismiss', () => {
  it('closes on a pointerdown outside the popup', () => {
    const close = vi.fn()
    render(<Popup open close={close} />)
    fireEvent.pointerDown(screen.getByText('inside'))
    expect(close).not.toHaveBeenCalled()
    fireEvent.pointerDown(screen.getByText('outside'))
    expect(close).toHaveBeenCalledOnce()
  })

  it('closes on Escape and returns focus to the trigger', () => {
    const close = vi.fn()
    render(<Popup open close={close} />)
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(close).not.toHaveBeenCalled()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(close).toHaveBeenCalledOnce()
    expect(screen.getByText('trigger')).toHaveFocus()
  })

  it('does nothing while closed', () => {
    const close = vi.fn()
    render(<Popup open={false} close={close} />)
    fireEvent.pointerDown(screen.getByText('outside'))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(close).not.toHaveBeenCalled()
  })

  it('stops listening once closed', () => {
    const close = vi.fn()
    const { rerender } = render(<Popup open close={close} />)
    rerender(<Popup open={false} close={close} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(close).not.toHaveBeenCalled()
  })
})
