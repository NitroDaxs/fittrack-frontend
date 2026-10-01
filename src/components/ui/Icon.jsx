export default function Icon({ name, size = 24, filled = false, className = '', style, ...rest }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}`,
        ...style,
      }}
      {...rest}
    >
      {name}
    </span>
  )
}
