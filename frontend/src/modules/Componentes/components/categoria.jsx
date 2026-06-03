import React from 'react'
import { Cascader, Form, Upload, Typography, message, theme, Skeleton } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

const { Text } = Typography
const MAX_SIZE = 5 * 1024 * 1024
export default function Categoria ({
  categoriaOptions = [],
  loadingCategorias = false,
  loadingHierarchy = false,
  fileList = [],
  setFileList,
  setPreviewUrl,
  beforeUpload,
  onDeleteImage,
  }) {
const { token } = theme.useToken()
const handleUpload = ({ file, fileList: newList }) => {
  console.log('🔍 handleUpload - file:', file.name, file.status)
      if (file.status === 'removed') {
      if (setFileList) setFileList([])
      if (setPreviewUrl) setPreviewUrl('')
      onDeleteImage?.()
      return
    }
    const validList = newList.filter(f => f.originFileObj || f.url)
    if (setFileList) setFileList(validList.slice(-1))
    if (file.originFileObj && !file.url) {
      const reader = new FileReader()
        reader.onload = (e) => {
        console.log('📸 Preview cargado exitosamente')
        const result = e.target?.result
        if (result && setPreviewUrl) {
          setPreviewUrl(result)
        }
        }
        reader.onerror = () => {
        console.error('❌ Error leyendo archivo')
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
    if (!isValidType) {
      message.error('Solo se permiten imágenes JPEG, PNG o WEBP')
      return Upload.LIST_IGNORE
    }
    if (!isValidSize) {
      message.error('La imagen debe ser menor a 5MB')
      return Upload.LIST_IGNORE
    }
    return true
}
return (
    <div style={{ width: '100%', maxWidth: 400 }}>
        <Form.Item label="Categoría" name="categoriaId">
            {loadingCategorias ? (
                <Skeleton active paragraph={{ rows: 1, width: '100%' }} />
            ) : (
                <Cascader
                    options={categoriaOptions}  
                    placeholder="Selecciona categoría"
                    showSearch={{ filter: (input, option) => option.label.toLowerCase().includes(input.toLowerCase()) }}
                    disabled={loadingHierarchy}
                />
            )}
        </Form.Item>    
        <Form.Item label="Imagen del Producto">
            <Upload
                name="file"
                listType="picture-card"
                fileList={fileList}
                onChange={handleUpload}
                beforeUpload={internalBeforeUpload}
                onRemove={() => {
                    if (setFileList) setFileList([])
                    if (setPreviewUrl) setPreviewUrl('')
                    onDeleteImage?.()
                }
                }
                accept="image/jpeg,image/png,image/webp"
                maxCount={1}
            >
                {fileList.length >= 1 ? null : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <UploadOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
                        <Text style={{ marginTop: 8, color: token.colorTextSecondary }}>Subir</Text>
                    </div>
                )}
            </Upload>
        </Form.Item>
    </div>
)
}

