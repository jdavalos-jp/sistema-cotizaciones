import React, { useState } from 'react'
import { Card, Cascader, Form, Upload, Space, Typography, Button, message, theme, Skeleton, Flex } from 'antd'
import { UploadOutlined, DeleteOutlined, PictureOutlined, FileImageOutlined } from '@ant-design/icons'

const { Text } = Typography
const MAX_SIZE = 5 * 1024 * 1024

export default function ProductoImagenYCategoria({
  categoriaOptions = [],
  loadingCategorias = false,
  loadingHierarchy = false,
  fileList = [],
  setFileList,
  previewUrl = '',
  setPreviewUrl,
  beforeUpload,
  onDeleteImage,
  initialFile = null,
}) {
  const { token } = theme.useToken()
  const [hovered, setHovered] = useState(false)

  const handleUpload = ({ file, fileList: newList }) => {
    const newFileList = newList.slice(-1)
    if (setFileList) setFileList(newFileList)

    if (file.status === 'removed') {
      if (setPreviewUrl) setPreviewUrl('')
      onDeleteImage?.()
      return
    }

    if (file.originFileObj) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (setPreviewUrl) setPreviewUrl(e.target.result)
      }
      reader.readAsDataURL(file.originFileObj)
    }
  }

  const internalBeforeUpload = (file) => {
    if (beforeUpload) {
      return beforeUpload(file)
    }
    const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    const isValidSize = file.size <= MAX_SIZE

    if (!isValidType) message.error('Formato no permitido (JPG, PNG, WebP)')
    if (!isValidSize) message.error(`Máximo ${MAX_SIZE / 1024 / 1024}MB`)

    return isValidType && isValidSize
  }

  return (
    <div style={{ width: '100%' }}>
      <Card
        title={<Space><PictureOutlined style={{ color: token.colorPrimary, fontSize: 18 }} />Foto del producto</Space>}
        size="small"
        style={{
          marginBottom: token.marginMD,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: `0 2px 8px ${token.colorBorder}`,
        }}
      >
        {!previewUrl ? (
          <Upload.Dragger
            accept="image/jpeg,image/png,image/webp"
            maxCount={1}
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleUpload}
            showUploadList={false}
          >
            <Space orientation="vertical" align="center" style={{ width: '100%' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '100%',
                background: token.colorPrimaryBg, display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <UploadOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
              </div>
              <Text strong>Arrastra o haz clic</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>JPG, PNG, WebP (Máx. 5MB)</Text>
              <Button type="primary" ghost>Seleccionar</Button>
            </Space>
          </Upload.Dragger>
        ) : (
          <div
            style={{ position: 'relative', borderRadius: token.borderRadiusLG, overflow: 'hidden' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <img src={previewUrl} alt="Preview" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: hovered ? 'flex' : 'none',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Button danger icon={<DeleteOutlined />} onClick={() => {
                if (setFileList) setFileList([])
                if (setPreviewUrl) setPreviewUrl('')
                onDeleteImage?.()
              }}>Cambiar</Button>
            </div>
            <div style={{ display: fileList[0] ? 'block' : 'none' }}>
              <Flex justify="space-between" style={{ marginTop: 8, padding: 4, background: token.colorFillSecondary, borderRadius: 4 }}>
                <Space size={4}><FileImageOutlined /><Text ellipsis style={{ maxWidth: 180 }}>{fileList[0]?.name}</Text></Space>
                <Text type="secondary">{((fileList[0]?.size || 0) / 1024).toFixed(0)} KB</Text>
              </Flex>
            </div>
          </div>
        )}
      </Card>

      <Card
        title="Categoría del producto"
        size="small"
        style={{
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: `0 2px 8px ${token.colorBorder}`,
        }}
      >
        {(loadingCategorias || loadingHierarchy) ? (
          <Skeleton active paragraph={{ rows: 1 }} />
        ) : (
          <>
            <Form.Item
              name="categoriaPath"
              rules={[
                {
                  required: true,
                  message: 'Campo requerido - Selecciona una categoría y subcategoría',
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Cascader
                options={categoriaOptions}
                placeholder="Selecciona una subcategoría"
                loading={loadingCategorias || loadingHierarchy}
                showSearch={{ filter: (input, path) => path.some(p => p.label.toLowerCase().includes(input.toLowerCase())) }}
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
            {!loadingCategorias && !categoriaOptions?.length && (
              <Text type="secondary">No hay categorías disponibles</Text>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
