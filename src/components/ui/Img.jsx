import { useState } from 'react'
import Icon from './Icon'

/**
 * Image with a themed fallback. The mock data points at the stock photography
 * from the design files; if a URL ever fails we show a tinted tile with the
 * exercise/routine icon rather than a broken-image glyph.
 */
export default function Img({ src, alt = '', icon = 'fitness_center', className = '', imgClassName = '' }) {
  const [failed, setFailed] = useState(!src)

  if (failed) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-surface-container-high text-outline ${className}`}
        role="img"
        aria-label={alt}
      >
        <Icon name={icon} size={32} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} ${imgClassName}`.trim()}
    />
  )
}
