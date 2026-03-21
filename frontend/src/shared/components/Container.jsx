/**
 * Contenedor principal con ancho máximo y espaciado
 * @param {string} size - Tamaño: 'sm', 'md', 'lg', 'xl'
 */
const Container = ({
  children,
  className = '',
//size = 'lg',
  style = {},
  ...props
}) => {
  const getMaxWidth = () => {
    switch (size) {
      case 'sm':
        return '640px'
      case 'md':
        return '960px'
      case 'xl':
        return '1400px'
      case 'lg':
      default:
        return '1200px'
    }
  }

  return (
    <div
      className={className}
      style={{
        width: '100%',
        maxWidth: getMaxWidth(),
        margin: '0 auto',
        padding: '0 16px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export default Container
