import { useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import ClienteForm from '../../modules/Clientes/components/ClienteForm'

/**
 * Página Formulario de Cliente
 * - Permite crear nuevos clientes (/clientes/crear)
 * - Permite editar clientes existentes (/clientes/editar/:id)
 * - Wrapper para ClienteForm
 */
export default function ClienteFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const handleSuccess = () => {
    navigate('/clientes')
  }

  const handleCancel = () => {
    navigate('/clientes')
  }

  const breadcrumbItems = [
    {
      title: (
        <a onClick={() => navigate('/')}>
          <HomeOutlined />
          <span style={{ marginLeft: 8 }}>Inicio</span>
        </a>
      ),
    },
    {
      title: (
        <a onClick={() => navigate('/clientes')}>Clientes</a>
      ),
    },
    {
      title: id ? 'Editar Cliente' : 'Agregar Cliente',
    },
  ]

  return (
    <>
      <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 24 }} />

      <ClienteForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        idClienteEdit={id ? BigInt(id) : null}
      />
    </>
  )
}
