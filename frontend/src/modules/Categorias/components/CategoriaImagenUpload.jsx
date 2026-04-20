import React, { useState, useRef } from 'react'
import { Card, Upload, Space, Typography, Button, message, theme, Flex } from 'antd'
import { UploadOutlined, DeleteOutlined, FileImageOutlined ,PictureOutlined} from '@ant-design/icons'

const { Text } = Typography
const MAX_SIZE = 5 * 1024 * 1024

/**
 * CategoriaImagenUpload
 * Componente para subir imagen de categoría (igual al de productos)
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

    // Mantener el archivo en la lista
    const validList = newList.filter(f => f.originFileObj || f.url)
    onFileChange(validList.slice(-1))

    // Leer y mostrar preview
    if (file.originFileObj && !file.url) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (result) {
          // Callback para actualizar previewUrl en el padre
          // Usamos un atributo data para pasar la URL
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
      return false
    }
    if (!isValidSize) {
      message.error(`Máximo ${MAX_SIZE / 1024 / 1024}MB`)
      return false
    }

    return isValidType && isValidSize
  }

  const handleDeleteImage = () => {
    onFileChange([])
    onDeleteImage?.()
  }

  return (
    <Card
      title={
        <Space>
          <span style={{ fontSize: 18,color: token.colorPrimary }}><PictureOutlined /></span>
          <span>Imagen del Componente</span>
        </Space>
      }
      size="small"
      style={{
        marginBottom: 0,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorder}`,
        boxShadow: `0 1px 2px 0 rgba(0, 0, 0, 0.03)`,
      }}
    >
      {!previewUrl ? (
        <Upload.Dragger
          accept="image/jpeg,image/png,image/webp"
          maxCount={1}
          fileList={fileList}
          beforeUpload={beforeUpload}
          onChange={handleUpload}
          showUploadList={false}
          customRequest={({ file, onSuccess }) => {
            setTimeout(() => onSuccess('ok'), 0)
          }}
        >
          <Space orientation="vertical" align="center" style={{ width: '100%', padding: '20px' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '100%',
                background: token.colorPrimaryBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UploadOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            </div>
            <Text strong>Arrastra o haz clic</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              JPG, PNG, WebP (Máx. 5MB)
            </Text>
            <Button type="primary" ghost>
              Seleccionar
            </Button>
          </Space>
        </Upload.Dragger>
      ) : (
        <div
          style={{
            position: 'relative',
            borderRadius: token.borderRadiusLG,
            overflow: 'hidden',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: '100%',
              aspectRatio: '1/1',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: hovered ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteImage}
            >
              Cambiar
            </Button>
          </div>
          {fileList[0] && (
            <div style={{ marginTop: 8 }}>
              <Flex
                justify="space-between"
                style={{
                  padding: '8px 12px',
                  background: token.colorFillSecondary,
                  borderRadius: token.borderRadiusSM,
                }}
              >
                <Space size={4}>
                  <FileImageOutlined />
                  <Text ellipsis style={{ maxWidth: 180 }}>
                    {fileList[0]?.name}
                  </Text>
                </Space>
                <Text type="secondary">
                  {((fileList[0]?.size || 0) / 1024).toFixed(0)} KB
                </Text>
              </Flex>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
