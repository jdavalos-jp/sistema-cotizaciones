import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Card, message, Modal, Segmented, Space, Typography } from 'antd'
import { FilePdfOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons'
import NotaForm from './components/NotaForm.jsx'
import NotaPreview from './components/NotaPreview.jsx'
import NotasHistory from './components/NotasHistory.jsx'
import { createEmptyNota, duplicateNota, normalizeNota } from './domain/nota.js'
import { useNotas } from './hooks/useNotas.js'
import { downloadNotaPdf } from './utils/downloadNotaPdf.js'
import './notas.css'

const { Title, Text } = Typography

export default function NotasPage() {
  const { notas, saveNota, deleteNota } = useNotas()
  const [view, setView] = useState('crear')
  const [editing, setEditing] = useState(null)
  const [formValue, setFormValue] = useState(createEmptyNota)
  const [draft, setDraft] = useState(createEmptyNota)
  const [viewing, setViewing] = useState(null)
  const [pdfQueue, setPdfQueue] = useState(null)
  const exportRef = useRef(null)
  const handleChange = useCallback((values) => setDraft(normalizeNota(values)), [])

  useEffect(() => {
    if (!pdfQueue || !exportRef.current) return
    let active = true
    downloadNotaPdf(pdfQueue, exportRef.current)
      .catch((error) => message.error(error.message || 'No se pudo generar el PDF'))
      .finally(() => { if (active) setPdfQueue(null) })
    return () => { active = false }
  }, [pdfQueue])

  const reset = useCallback(() => {
    const empty = createEmptyNota()
    setEditing(null)
    setFormValue(empty)
    setDraft(empty)
  }, [])
  const save = (values) => {
    try {
      saveNota(values, editing?.id)
      message.success(values.estado === 'finalizada' ? 'Nota finalizada' : 'Borrador guardado')
      reset()
      setView('historial')
    } catch (error) {
      message.error(error.message || 'No se pudo guardar la nota')
    }
  }
  const edit = (nota) => { setEditing(nota); setFormValue(nota); setDraft(nota); setView('crear') }
  const duplicate = (nota) => { const copy = duplicateNota(nota); setEditing(null); setFormValue(copy); setDraft(copy); setView('crear') }
  const remove = (id) => { deleteNota(id); message.success('Nota eliminada') }

  return <div className="notas-page">
    <header className="notas-page__header">
      <div><Title level={3}>Notas</Title><Text type="secondary">Inicio / Documentos / Notas de entrega</Text></div>
      <Segmented value={view} onChange={(value) => { setView(value); if (value === 'crear' && !editing) reset() }} options={[
        { value: 'crear', label: 'Crear nota', icon: <PlusOutlined /> },
        { value: 'historial', label: 'Historial', icon: <HistoryOutlined /> },
      ]} />
    </header>

    {view === 'crear' ? <div className="notas-create-grid">
      <Card title={editing ? 'Editar nota de entrega' : 'Datos de la nota de entrega'} extra={editing ? <Text type="warning">Modo edición</Text> : null} variant="borderless">
        <NotaForm nota={formValue} onCancel={reset} onChange={handleChange} onSave={save} />
      </Card>
      <aside className="notas-preview-column">
        <div className="notas-preview-heading"><div><Text strong>Vista previa</Text><br /><Text type="secondary">Nota de entrega y verificación</Text></div><Button type="primary" icon={<FilePdfOutlined />} disabled={!draft.clienteEntidad} onClick={() => setPdfQueue(draft)}>Descargar PDF</Button></div>
        <div className="notas-preview-scroll"><NotaPreview nota={draft} /></div>
      </aside>
    </div> : <Card title="Historial de notas" variant="borderless"><NotasHistory notas={notas} onDelete={remove} onDuplicate={duplicate} onEdit={edit} onPdf={setPdfQueue} onView={setViewing} /></Card>}

    <Modal title="Vista previa de la nota" open={Boolean(viewing)} onCancel={() => setViewing(null)} width={1000} footer={viewing ? <Button type="primary" icon={<FilePdfOutlined />} onClick={() => setPdfQueue(viewing)}>Descargar PDF</Button> : null}>
      {viewing && <div className="nota-modal-preview"><NotaPreview nota={viewing} /></div>}
    </Modal>
    {pdfQueue && <div className="nota-pdf-sandbox" aria-hidden="true"><NotaPreview ref={exportRef} nota={pdfQueue} /></div>}
  </div>
}
