import { Card as AntCard } from 'antd'

/**
 * Wrapper simple del Card de Ant Design
 * Usa automáticamente los estilos del tema centralizado
 */
const Card = (props) => {
  return <AntCard {...props} />
}

export default Card
