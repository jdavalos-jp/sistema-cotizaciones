import { Button as AntButton } from 'antd'

/**
 * Wrapper simple del botón de Ant Design
 * Usa automáticamente los estilos del tema centralizado
 */
const Button = ({
  variant = 'primary',
  ...props
}) => {
  const getButtonType = () => {
    switch (variant) {
      case 'primary':
        return 'primary'
      case 'secondary':
      case 'default':
        return 'default'
      case 'dashed':
        return 'dashed'
      case 'text':
      case 'ghost':
        return 'text'
      default:
        return 'primary'
    }
  }

  return <AntButton type={getButtonType()} {...props} />
}

export default Button
