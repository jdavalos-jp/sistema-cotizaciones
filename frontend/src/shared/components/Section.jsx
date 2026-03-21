/**
 * Sección de contenido con espaciado consistente
 */
const Section = ({
  children,
  className = '',
  title,
  style = {},
  ...props
}) => {
  return (
    <section
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        ...style,
      }}
      {...props}
    >
      {title && (
        <h2
          style={{
            margin: '0 0 8px 0',
            fontSize: '20px',
            fontWeight: 600,
            color: '#000000',
          }}
        >
          {title}
        </h2>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </section>
  )
}

export default Section
