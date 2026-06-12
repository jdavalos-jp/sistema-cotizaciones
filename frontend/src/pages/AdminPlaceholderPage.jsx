import { Card, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function AdminPlaceholderPage({ title }) {
  return (
    <Card bordered={false}>
      <Title level={2}>{title}</Title>
      <Paragraph>
        Módulo administrativo preparado para integrarse con la autenticación real del backend.
      </Paragraph>
    </Card>
  )
}
