import { Button, Image, Space, Upload, message } from 'antd'
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(file)
  })
}

export default function ImageDataUrlField({ value, onChange, label = 'Imagen', maxSizeMb = 1 }) {
  const handleFile = async (file) => {
    if (file.size > maxSizeMb * 1024 * 1024) {
      message.error(`La imagen debe pesar menos de ${maxSizeMb} MB`)
      return Upload.LIST_IGNORE
    }
    onChange?.(await readAsDataUrl(file))
    return false
  }

  return (
    <Space direction="vertical" size={8} className="image-data-url-field">
      {value && <Image src={value} alt={label} className="image-data-url-field__preview" />}
      <Space wrap>
        <Upload accept="image/png,image/jpeg,image/webp" beforeUpload={handleFile} maxCount={1} showUploadList={false}>
          <Button icon={<UploadOutlined />}>{value ? 'Cambiar imagen' : 'Seleccionar imagen'}</Button>
        </Upload>
        {value && <Button danger type="text" icon={<DeleteOutlined />} onClick={() => onChange?.('')}>Quitar</Button>}
      </Space>
    </Space>
  )
}

