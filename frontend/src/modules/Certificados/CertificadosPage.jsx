import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Card, message, Modal, Segmented, Space, Typography } from 'antd'
import { FilePdfOutlined, FileWordOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons'
import logoJdblab from '../../../images/logojdblab.jpeg.png'
import CertificadoForm from './components/CertificadoForm.jsx'
import CertificadoPreview from './components/CertificadoPreview.jsx'
import CertificadosHistory from './components/CertificadosHistory.jsx'
import { createEmptyCertificado, duplicateCertificado, normalizeCertificado } from './domain/certificado.js'
import { useCertificados } from './hooks/useCertificados.js'
import { downloadCertificadoPdf } from './utils/downloadCertificadoPdf.js'
import { downloadCertificadoWord } from './utils/downloadCertificadoWord.js'
import './certificados.css'

const { Title, Text } = Typography

export default function CertificadosPage() {
  const { certificados, saveCertificado, deleteCertificado } = useCertificados()
  const [view, setView] = useState('crear')
  const [editing, setEditing] = useState(null)
  const [formValue, setFormValue] = useState(createEmptyCertificado)
  const [draft, setDraft] = useState(createEmptyCertificado)
  const [viewing, setViewing] = useState(null)
  const [pdfQueue, setPdfQueue] = useState(null)
  const exportRef = useRef(null)
  const handleChange = useCallback((values) => setDraft(normalizeCertificado(values)), [])

  useEffect(() => {
    if (!pdfQueue || !exportRef.current) return
    let active = true
    downloadCertificadoPdf(pdfQueue, exportRef.current)
      .catch((error) => message.error(error.message || 'No se pudo generar el PDF'))
      .finally(() => { if (active) setPdfQueue(null) })
    return () => { active = false }
  }, [pdfQueue])

  const reset = useCallback(() => {
    const empty = createEmptyCertificado()
    setEditing(null); setFormValue(empty); setDraft(empty)
  }, [])
  const save = (values) => {
    try {
      saveCertificado(values, editing?.id)
      message.success(values.estado === 'finalizado' ? 'Certificado finalizado' : 'Borrador guardado')
      reset(); setView('historial')
    } catch (error) { message.error(error.message || 'No se pudo guardar') }
  }
  const edit = (item) => { setEditing(item); setFormValue(item); setDraft(item); setView('crear') }
  const duplicate = (item) => { const copy = duplicateCertificado(item); setEditing(null); setFormValue(copy); setDraft(copy); setView('crear') }
  const remove = (id) => { deleteCertificado(id); message.success('Certificado eliminado') }
  const word = async (item) => {
    try { await downloadCertificadoWord(item, logoJdblab) }
    catch (error) { message.error(error.message || 'No se pudo generar el Word') }
  }

  return <div className="certificados-page">
    <header className="certificados-page__header">
      <div><Title level={3}>Certificados</Title><Text type="secondary">Inicio / Documentos / Certificados</Text></div>
      <Segmented value={view} onChange={(value) => { setView(value); if (value === 'crear' && !editing) reset() }} options={[
        { value: 'crear', label: 'Crear certificado', icon: <PlusOutlined /> },
        { value: 'historial', label: 'Historial', icon: <HistoryOutlined /> },
      ]} />
    </header>
    {view === 'crear' ? <div className="certificados-create-grid">
      <Card title={editing ? 'Editar certificado' : 'Datos del certificado'} extra={editing ? <Text type="warning">Modo edición</Text> : null} variant="borderless">
        <CertificadoForm certificado={formValue} onCancel={reset} onChange={handleChange} onSave={save} />
      </Card>
      <aside className="certificados-preview-column">
        <div className="certificados-preview-heading"><div><Text strong>Vista previa</Text><br /><Text type="secondary">Certificado de garantía</Text></div><Space wrap><Button icon={<FileWordOutlined />} disabled={!draft.clienteEntidad} onClick={() => word(draft)}>Word</Button><Button icon={<FilePdfOutlined />} disabled={!draft.clienteEntidad} onClick={() => setPdfQueue(draft)}>PDF</Button></Space></div>
        <div className="certificados-preview-scroll"><CertificadoPreview certificado={draft} /></div>
      </aside>
    </div> : <Card title="Historial de certificados" variant="borderless"><CertificadosHistory certificados={certificados} onDelete={remove} onDuplicate={duplicate} onEdit={edit} onPdf={setPdfQueue} onView={setViewing} onWord={word} /></Card>}

    <Modal title="Vista previa del certificado" open={Boolean(viewing)} onCancel={() => setViewing(null)} width={960} footer={viewing ? <Button type="primary" icon={<FilePdfOutlined />} onClick={() => setPdfQueue(viewing)}>Descargar PDF</Button> : null}>
      {viewing && <div className="certificado-modal-preview"><CertificadoPreview certificado={viewing} /></div>}
    </Modal>
    {pdfQueue && <div className="certificado-pdf-sandbox" aria-hidden="true"><CertificadoPreview ref={exportRef} certificado={pdfQueue} /></div>}
  </div>
}
