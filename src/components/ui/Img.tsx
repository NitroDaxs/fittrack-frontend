import { useState } from 'react'
import Icon from './Icon'

interface ImgProps {
  src?: string | null
  alt?: string
  icon?: string
  className?: string
  imgClassName?: string
}

/**
 * Image with a themed fallback: a missing or failed URL shows a tinted tile with
 * the exercise/routine icon rather than a broken-image glyph.
 */
export default function Img({ src, alt = '', icon = 'fitness_center', className = '', imgClassName = '' }: ImgProps) {
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
      src={src ?? undefined}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} ${imgClassName}`.trim()}
    />
  )
}
