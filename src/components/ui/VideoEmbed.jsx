import { useState } from 'react'
import Icon from './Icon'
import Img from './Img'

/**
 * Click-to-play YouTube embed.
 *
 * The thumbnail is shown on its own until the user actually asks for the
 * video, so page load costs one image rather than YouTube's player bundle.
 * With no `videoId` we render the poster with no play button -- an affordance
 * that does nothing is worse than no affordance.
 */
export default function VideoEmbed({ videoId, poster, title = '', icon = 'fitness_center', className = '' }) {
  const [playing, setPlaying] = useState(false)

  // 16:9 matches both the player and YouTube's thumbnails. hqdefault is 4:3
  // with the frame letterboxed in the middle, so object-cover on a 16:9 box
  // crops off exactly the black bars.
  const frame = `relative rounded-xl overflow-hidden aspect-video bg-surface-container-high elev-card ${className}`

  if (videoId && playing) {
    return (
      <div className={frame}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title ? `${title} demonstration` : 'Exercise demonstration'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    )
  }

  return (
    <div className={frame}>
      <Img src={poster} alt={title} icon={icon} imgClassName="w-full h-full object-cover" />
      {videoId ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={title ? `Play ${title} demonstration` : 'Play demonstration video'}
          className="absolute inset-0 flex items-center justify-center group focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/50"
        >
          <span className="w-16 h-16 rounded-full bg-surface/90 backdrop-blur-sm flex items-center justify-center text-primary elev-overlay transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
            <Icon name="play_arrow" size={32} filled />
          </span>
        </button>
      ) : null}
    </div>
  )
}
