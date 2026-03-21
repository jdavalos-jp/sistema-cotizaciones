/**
 * Componente de título/encabezado predefinido
 * @param {string} level - Nivel de encabezado: 1, 2, 3, 4
 */
const Title = ({
  level = 1,
  children,
  className = '',
  style = {},
  ...props
}) => {
  const Component = `h${level}`

  const getTitleStyles = () => {
    const baseStyles = {
      margin: '0',
      color: '#000000',
      fontWeight: 600,
    }

    switch (level) {
      case 1:
        return { ...baseStyles, fontSize: '32px', letterSpacing: '-0.5px' }
      case 2:
        return { ...baseStyles, fontSize: '24px', letterSpacing: '-0.25px' }
      case 3:
        return { ...baseStyles, fontSize: '20px' }
      case 4:
        return { ...baseStyles, fontSize: '16px' }
      default:
        return { ...baseStyles, fontSize: '24px' }
    }
  }

  return (
    <Component
      className={className}
      style={{ ...getTitleStyles(), ...style }}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Title
