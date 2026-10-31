import { useState } from 'react'
import Icon from './Icon'

interface AvatarProps {
  url?: string | null
  /** Pixels. */
  size?: number
  iconSize?: number
  className?: string
}

/** A person's picture, or a user icon when there's none or it fails to load. */
export default function Avatar({ url, size = 40, iconSize, className = '' }: AvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const showImage = url && url !== failedUrl

  return (
    <span
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-fixed text-on-primary-fixed-variant ${className}`}
    >
      {showImage ? (
        <img src={url} alt="" onError={() => setFailedUrl(url)} className="h-full w-full object-cover" />
      ) : (
        <Icon name="user" size={iconSize ?? Math.round(size / 2)} />
      )}
    </span>
  )
}
