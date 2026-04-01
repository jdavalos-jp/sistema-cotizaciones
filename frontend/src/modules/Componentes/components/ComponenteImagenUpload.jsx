import React, { useState } from 'react'
import {
  Card,
  Form,
  Upload,
  Space,
  Typography,
  Button,
  message,
  theme,
  Flex,
} from 'antd'
import { UploadOutlined, DeleteOutlined, PictureOutlined, FileImageOutlined } from '@ant-design/icons'

const { Text } = Typography
const MAX_SIZE = 5 * 1024 * 1024 // 5MB en bytes

/**
 * ComponenteImagenUpload
 * 
 * ¿QUÉ HACE?
 * - Permite subir una imagen para el componente
 * - Muestra una vista previa de la imagen
 * - Valida que sea JPG/PNG/WebP y menor a 5MB
 * 
 * ¿por QUÉ EXISTE?
 * - Separar responsabilidades (un componente = una cosa)
 * - Reutilizar en crear vs editar
 * - Código más limpio y testeable
 * 
 * PROPS que recibe (entiéndelos como "órdenes")
 * - fileList: arreglo con archivo actual
 * - setFileList: función para guardar archivo nuevo
 * - previewUrl: URL de la imagen a mostrar
 * - setPreviewUrl: función para cambiar preview
 * - beforeUpload: validación personalizada (opcional)
 * - onDeleteImage: qué hacer si borra la imagen
 */
export default function ComponenteImagenUpload({
  fileList = [],
  setFileList,
  previewUrl = '',
  setPreviewUrl,
  beforeUpload,
  onDeleteImage,
}) {
  const { token } = theme.useToken() // Estilos consistentes del tema
  const [hovered, setHovered] = useState(false) // ¿Está el mouse sobre la imagen?

  /**
   * handleUpload - Qué hacer cuando el usuario sube/elimina un archivo
   * 
   * Parámetros:
   * - file: el archivo nuevo
   * - fileList: todos los archivos en la lista
   */
  const handleUpload = ({ file, fileList: newList }) => {
    console.log('📤 Subida de archivo:', file.name, file.status)
    
    // Si el usuario quitó la imagen
    if (file.status === 'removed') {
      setFileList?.([]); // Limpiar
      setPreviewUrl?.(''); // Limpiar preview
      onDeleteImage?.(); // Ejecutar callback si existe
      return
    }

    // Mantener solo archivos válidos (nuevos o ya subidos)
    const validList = newList.filter(f => f.originFileObj || f.url)
    setFileList?.(validList.slice(-1)) // Guardar el último (maxCount=1)

    // Si es un archivo NUEVO (no está en BD), generar preview inmediato
    if (file.originFileObj && !file.url) {
      const reader = new FileReader() // Leer archivo del usuario
      
      reader.onload = (e) => {
        // Cuando se cargue el archivo se ejecuta esto
        const result = e.target?.result // Convertir a URL
        if (result && setPreviewUrl) {
          setPreviewUrl(result) // Mostrar preview inmediatamente
        }
      }

      reader.onerror = () => {
        console.error('❌ Error leyendo archivo')
      }

      reader.readAsDataURL(file.originFileObj) // Convertir a formato URL
    }
  }

  /**
   * internalBeforeUpload
   * 
   * Validar ANTES de que suba el archivo
   * Retorna:
   * - true: OK, proceder
   * - Upload.LIST_IGNORE: No incluir en lista
   */
  const internalBeforeUpload = (file) => {
    // Si le pasaron validación personalizada, usarla
    if (beforeUpload) {
      return beforeUpload(file)
    }

    // Si no, validar aquí
    const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    const isValidSize = file.size <= MAX_SIZE

    if (!isValidType) {
      message.error('Formato no permitido (JPG, PNG, WebP)')
      return Upload.LIST_IGNORE // No incluir
    }

    if (!isValidSize) {
      message.error(`Máximo ${MAX_SIZE / 1024 / 1024}MB`)
      return Upload.LIST_IGNORE
    }

    return true // OK
  }

  return (
    <div style={{ width: '100%' }}>
      <Card
        // Encabezado de la tarjeta
        title={
          <Space>
            <PictureOutlined style={{ color: token.colorPrimary, fontSize: 18 }} />
            Imagen del Componente
          </Space>
        }
        size="small"
        style={{
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: `0 2px 8px ${token.colorBorder}`,
        }}
      >
        {/* SI NO HAY IMAGEN: mostrar zona de carga */}
        {!previewUrl ? (
          <Upload.Dragger
            accept="image/jpeg,image/png,image/webp"
            maxCount={1} // Solo 1 imagen
            fileList={fileList}
            beforeUpload={internalBeforeUpload}
            onChange={handleUpload}
            showUploadList={false} // No mostrar la lista automática
            customRequest={({ onSuccess }) => {
              // No hacer request real (lo hace el padre)
              setTimeout(() => onSuccess('ok'), 0)
            }}
          >
            {/* Contenido visual de la zona de carga */}
            <Space orientation="vertical" align="center" style={{ width: '100%' }}>
              {/* Icono grande */}
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
              {/* Textos */}
              <Text strong>Arrastra o haz clic</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                JPG, PNG, WebP (Máx. 5MB)
              </Text>
              {/* Botón */}
              <Button type="primary" ghost>
                Seleccionar
              </Button>
            </Space>
          </Upload.Dragger>
        ) : (
          /* SI HAY IMAGEN: mostrar preview */
          <div
            style={{
              position: 'relative',
              borderRadius: token.borderRadiusLG,
              overflow: 'hidden',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* La imagen */}
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
            />

            {/* Overlay (fondo oscuro) cuando está hovered */}
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
              {/* Botón de cambiar */}
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setFileList?.([])
                  setPreviewUrl?.('')
                  onDeleteImage?.()
                }}
              >
                Cambiar
              </Button>
            </div>

            {/* Info del archivo */}
            <Flex
              justify="space-between"
              style={{
                marginTop: 8,
                padding: 4,
                background: token.colorFillSecondary,
                borderRadius: 4,
              }}
            >
              <Space size={4}>
                <FileImageOutlined />
                <Text ellipsis style={{ maxWidth: 180 }}>
                  {fileList[0]?.name}
                </Text>
              </Space>
              <Text type="secondary">{((fileList[0]?.size || 0) / 1024).toFixed(0)} KB</Text>
            </Flex>
          </div>
        )}
      </Card>
    </div>
  )
}