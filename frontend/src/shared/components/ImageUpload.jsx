// components/ImageUpload/ImageUpload.jsx
import React, { useMemo, useState } from 'react'
import { Card, Upload, message, Image, theme } from 'antd'
import {
  PlusOutlined,
  InfoCircleOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons'
import ImgCrop from 'antd-img-crop'

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.readAsDataURL(file)

    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })

export default function ImageUpload({
  fileList = [],
  onFileChange,

  title = 'Imágenes',
  uploadLabel = 'Subir',

  maxCount = 1,
  maxSizeMB = 2,
  accept = ['image/jpeg', 'image/png', 'image/webp'],

  enableCrop = true,
  enableRotation = true,

  showPrincipalToggle = false,
  onPrincipalChange,
}) {
  const { token } = theme.useToken()

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  const maxSizeBytes = useMemo(() => {
    return maxSizeMB * 1024 * 1024
  }, [maxSizeMB])

  const acceptedTypes = useMemo(() => {
    return accept.join(',')
  }, [accept])

  const hint = useMemo(() => {
    if (maxCount === 1) {
      return `La imagen no puede ser mayor a ${maxSizeMB} MB.`
    }

    return `Máximo ${maxCount} imágenes, cada una hasta ${maxSizeMB} MB.`
  }, [maxCount, maxSizeMB])

  const beforeUpload = (file) => {
    const isValidType = accept.includes(file.type)
    const isValidSize = file.size <= maxSizeBytes

    if (!isValidType) {
      const formatos = accept
        .map((type) => type.split('/')[1]?.toUpperCase())
        .filter(Boolean)
        .join(', ')

      message.error(`Formato no permitido. Usa: ${formatos}`)
      return Upload.LIST_IGNORE
    }

    if (!isValidSize) {
      message.error(`La imagen no puede superar los ${maxSizeMB} MB.`)
      return Upload.LIST_IGNORE
    }

    return false
  }

  const handlePreview = async (file) => {
    try {
      const imageSource =
        file.url ||
        file.preview ||
        (file.originFileObj ? await getBase64(file.originFileObj) : '')

      if (!imageSource) {
        message.warning('No se pudo generar la vista previa de la imagen.')
        return
      }

      setPreviewImage(imageSource)
      setPreviewOpen(true)
    } catch (error) {
      message.error('No se pudo previsualizar la imagen.')
    }
  }

  const handleUploadChange = ({ fileList: newList }) => {
    const normalizedList = newList.map((file, index) => ({
      ...file,
      orden: file.orden ?? index + 1,
      principal:
        showPrincipalToggle && newList.length === 1
          ? true
          : file.principal ?? false,
    }))

    onFileChange?.(normalizedList)
  }

  const handleSetPrincipal = (event, uid) => {
    event.preventDefault()
    event.stopPropagation()

    const updatedList = fileList.map((file) => ({
      ...file,
      principal: file.uid === uid,
    }))

    onFileChange?.(updatedList)
    onPrincipalChange?.(uid)
  }

  const itemRender = (originNode, file) => {
    if (!showPrincipalToggle) {
      return originNode
    }

    const isPrincipal = file.principal === true

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {originNode}

        <button
          type="button"
          title={isPrincipal ? 'Imagen principal' : 'Marcar como principal'}
          onClick={(event) => handleSetPrincipal(event, file.uid)}
          style={{
            position: 'absolute',
            bottom: 4,
            left: 4,
            border: 'none',
            background: isPrincipal ? token.colorPrimary : 'rgba(0,0,0,0.45)',
            color: '#fff',
            borderRadius: 4,
            padding: '1px 5px',
            fontSize: 11,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            zIndex: 2,
          }}
        >
          {isPrincipal ? (
            <StarFilled style={{ fontSize: 10 }} />
          ) : (
            <StarOutlined style={{ fontSize: 10 }} />
          )}

          {isPrincipal ? 'Principal' : 'Marcar'}
        </button>
      </div>
    )
  }

  const uploadContent = (
    <Upload
      listType="picture-card"
      fileList={fileList}
      beforeUpload={beforeUpload}
      onPreview={handlePreview}
      onChange={handleUploadChange}
      accept={acceptedTypes}
      maxCount={maxCount}
      itemRender={showPrincipalToggle ? itemRender : undefined}
    >
      {fileList.length < maxCount ? (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8, fontSize: 12 }}>{uploadLabel}</div>
        </div>
      ) : null}
    </Upload>
  )

  return (
    <Card
      title={<span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>}
      variant="borderless"
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
      styles={{
        body: {
          padding: 24,
          textAlign: 'center',
        },
      }}
    >
      <div
        style={{
          border: `1.5px dashed ${token.colorPrimary}`,
          backgroundColor: token.colorPrimaryBg,
          borderRadius: 8,
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {enableCrop ? (
          <ImgCrop rotationSlider={enableRotation}>
            {uploadContent}
          </ImgCrop>
        ) : (
          uploadContent
        )}

        <div
          style={{
            display: 'flex',
            gap: 8,
            fontSize: 12,
            color: '#8c8c8c',
            textAlign: 'left',
            lineHeight: 1.5,
          }}
        >
          <InfoCircleOutlined
            style={{
              marginTop: 2,
              color: token.colorPrimary,
            }}
          />

          <span>{hint}</span>
        </div>
      </div>

      {previewImage ? (
        <Image
          style={{ display: 'none' }}
          preview={{
            open: previewOpen,
            onOpenChange: setPreviewOpen,
            afterOpenChange: (open) => {
              if (!open) {
                setPreviewImage('')
              }
            },
          }}
          src={previewImage}
        />
      ) : null}
    </Card>
  )
}