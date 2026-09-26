import { EnvironmentOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'

export default function RotuloPreview({ rotulo, logoSource, paperSize = 'letter' }) {
  const uppercase = (value, fallback) => String(value || fallback).toUpperCase()

  return (
    <div className={`rotulo-preview rotulo-preview--${paperSize}`} aria-label="Vista previa del rótulo">
      <div className="rotulo-preview__recipient">
        <span className="rotulo-preview__eyebrow">DESTINATARIO</span>
        <h2><span>SEÑOR:</span> {uppercase(rotulo.nombre, 'NOMBRE DEL DESTINATARIO')}</h2>

        <div className="rotulo-preview__details">
          <span>{uppercase(rotulo.cargo, 'SIN CARGO REGISTRADO')}</span>
          <span><MailOutlined /> {uppercase(rotulo.correo, 'SIN CORREO REGISTRADO')}</span>
          <span><PhoneOutlined /> {uppercase(rotulo.telefono, 'SIN TELÉFONO REGISTRADO')}</span>
          <span><EnvironmentOutlined /> {uppercase(rotulo.ciudad, 'SIN CIUDAD REGISTRADA')}</span>
        </div>
      </div>

      <div className="rotulo-preview__sender">
        <img src={logoSource} alt="Remitente JDBlab" />
      </div>
    </div>
  )
}
