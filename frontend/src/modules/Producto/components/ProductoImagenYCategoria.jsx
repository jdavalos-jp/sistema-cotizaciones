import React from 'react'
import { Card, Cascader, Form, Space, Typography, theme, Skeleton } from 'antd'
import ImageUpload from '../../../shared/components/ImageUpload'

const { Text } = Typography

export default function ProductoImagenYCategoria({
  categoriaOptions = [],
  loadingCategorias = false,
  loadingHierarchy = false,
  fileList = [],
  setFileList,
  onDeleteImage,
}) {
  const { token } = theme.useToken()

  const handleFileChange = (newFileList) => {
    setFileList(newFileList)
    if (newFileList.length === 0 && onDeleteImage) {
      onDeleteImage()
    }
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: token.marginMD }}>
      <ImageUpload
        title="Foto del producto"
        fileList={fileList}
        onFileChange={handleFileChange}
        maxCount={1}
        maxSizeMB={5}
        uploadLabel="Seleccionar"
        hint="Puedes agregar una maximo de 1 imagen,cada una no puede ser mayor a 5 MB. "
      />

      <Card
        title="Categoría del producto"
        size="small"
        style={{
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: `0 2px 8px rgba(0,0,0,0.06)`,
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
