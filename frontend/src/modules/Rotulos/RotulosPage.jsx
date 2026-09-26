import { useCallback, useState } from 'react'
import { Button, Card, message, Segmented, Space, Typography } from 'antd'
import { HistoryOutlined, PlusOutlined } from '@ant-design/icons'
import rotuloImage from '../../../images/imgenRotulo.webp'
import RotuloForm from './components/RotuloForm.jsx'
import RotuloPreview from './components/RotuloPreview.jsx'
import RotulosHistory from './components/RotulosHistory.jsx'
import { useRotulos } from './hooks/useRotulos.js'
import { downloadRotuloPdf } from './utils/downloadRotuloPdf.js'
import './rotulos.css'

const { Title, Text } = Typography
const EMPTY_ROTULO = { clienteId: undefined, nombre: '', cargo: '', correo: '', telefono: '', ciudad: '' }

export default function RotulosPage() {
  const { rotulos, saveRotulo, deleteRotulo } = useRotulos()
  const [activeView, setActiveView] = useState('crear')
  const [editingRotulo, setEditingRotulo] = useState(null)
  const [draft, setDraft] = useState(EMPTY_ROTULO)

  const handleDraftChange = useCallback((values) => setDraft({ ...EMPTY_ROTULO, ...values }), [])

  const handleSave = (values) => {
    saveRotulo(values, editingRotulo?.id)
    message.success(editingRotulo ? 'Rótulo actualizado' : 'Rótulo creado')
    setEditingRotulo(null)
    setActiveView('historial')
  }

  const handleEdit = (rotulo) => {
    setEditingRotulo(rotulo)
    setActiveView('crear')
  }

  const handleCancelEdit = () => {
    setEditingRotulo(null)
    setDraft(EMPTY_ROTULO)
  }

  const handleDelete = (id) => {
    deleteRotulo(id)
    if (editingRotulo?.id === id) handleCancelEdit()
    message.success('Rótulo eliminado')
  }

  const handleDownload = async (rotulo) => {
    try {
      await downloadRotuloPdf(rotulo, rotuloImage)
    } catch (error) {
      message.error(error.message || 'No se pudo generar el PDF')
    }
  }

  const handleViewChange = (view) => {
    setActiveView(view)
    if (view === 'historial') handleCancelEdit()
  }

  return (
    <div className="rotulos-page">
      <div className="rotulos-page__header">
        <div>
          <Title level={3}>Rótulos</Title>
          <Text type="secondary">Inicio / Documentos / Rótulos</Text>
        </div>
        <Segmented
          value={activeView}
          onChange={handleViewChange}
          options={[
            { value: 'crear', label: 'Crear rótulo', icon: <PlusOutlined /> },
            { value: 'historial', label: 'Historial', icon: <HistoryOutlined /> },
          ]}
        />
      </div>

      {activeView === 'crear' ? (
        <div className="rotulos-create-grid">
          <Card
            title={editingRotulo ? 'Editar rótulo' : 'Datos del destinatario'}
            extra={editingRotulo ? <Text type="warning">Modo edición</Text> : null}
            variant="borderless"
          >
            <RotuloForm
              editingRotulo={editingRotulo}
              onCancel={handleCancelEdit}
              onChange={handleDraftChange}
              onSave={handleSave}
            />
          </Card>

          <Space direction="vertical" size={12} className="rotulos-preview-column">
            <div>
              <Text strong>Vista previa</Text>
              <br />
              <Text type="secondary">Los datos se imprimirán en mayúsculas.</Text>
            </div>
            <RotuloPreview rotulo={draft} logoSource={rotuloImage} />
            <Button
              block
              disabled={!draft.nombre?.trim()}
              onClick={() => handleDownload(draft)}
            >
              Descargar vista previa en PDF
            </Button>
          </Space>
        </div>
      ) : (
        <Card title="Historial de rótulos" variant="borderless">
          <RotulosHistory
            rotulos={rotulos}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onEdit={handleEdit}
          />
        </Card>
      )}
    </div>
  )
}
