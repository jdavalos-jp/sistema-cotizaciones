import { Input as AntInput } from 'antd'

/**
 * Wrapper simple del Input de Ant Design
 * Usa automáticamente los estilos del tema centralizado
 */
const Input = (props) => {
  return <AntInput {...props} />
}

export default Input
