import React, { useState } from 'react'
import { Card, Upload, Typography, Button, message, theme } from 'antd'
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Text } = Typography
const MAX_SIZE = 2 * 1024 * 1024

/**
 * CategoriaImagenUpload
 * Componente para subir imagen de categoría (diseño de miniatura)
 */
export default function CategoriaImagenUpload({
  fileList,
  onFileChange,
  onDeleteImage,
  previewUrl,
}) {
  const { token } = theme.useToken()
  const [hovered, setHovered] = useState(false)

  const handleUpload = ({ file, fileList: newList }) => {
    if (file.status === 'removed') {
      onFileChange([])
      return
    }

    const validList = newList.filter(f => f.originFileObj || f.url)
    onFileChange(validList.slice(-1))

    if (file.originFileObj && !file.url) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (result) {
          const event = new CustomEvent('image-preview', { detail: result })
          document.dispatchEvent(event)
        }
      }
      reader.readAsDataURL(file.originFileObj)
    }
  }

  const beforeUpload = (file) => {
    const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    const isValidSize = file.size <= MAX_SIZE

    if (!isValidType) {
      message.error('Formato no permitido. Solo JPG, PNG o WebP.')
      return Upload.LIST_IGNORE
    }
    if (!isValidSize) {
      message.error('El tamaño de la imagen no puede ser mayor a 2 MB.')
      return Upload.LIST_IGNORE
    }

    return false
  }

  return (
    <Card
      title={<span style={{ fontWeight: 600, fontSize: 16 }}>Miniatura</span>}
      style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', paddingBottom: 16 }}
      bodyStyle={{ padding: 24, textAlign: 'center' }}
    >
      {!previewUrl ? (
        <div style={{
          border: `1px dashed ${token.colorPrimary}`,
          backgroundColor: '#f0f5ff',
          borderRadius: 8,
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16
        }}>
          <Upload
            accept="image/jpeg,image/png,image/webp"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleUpload}
            showUploadList={false}
            maxCount={1}
          >
            <div
              style={{
                width: 100,
                height: 100,
                background: '#f5f5f5',
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                margin: '0 auto',
                transition: 'border-color 0.3s'
              }}
            >
              <div style={{ color: '#8c8c8c', fontSize: 14 }}>+ Subir</div>
            </div>
          </Upload>
          <div style={{ display: 'flex', gap: 8, color: '#8c8c8c', fontSize: 12, textAlign: 'left', lineHeight: 1.4 }}>
            <InfoCircleOutlined style={{ marginTop: 2 }} />
            <span>
              Puedes agregar un maximo de 1 imagenes, cada uno no puede ser mayor a 2 MB.
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            width: 160,
            height: 160,
            margin: '0 auto',
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid #f0f0f0'
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={previewUrl}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: hovered ? 'flex' : 'none',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Button danger icon={<DeleteOutlined />} onClick={() => { onFileChange([]); onDeleteImage?.() }}>
              Quitar
            </Button>
          </div>
        </div>
      )}

    </Card>
  )
}
