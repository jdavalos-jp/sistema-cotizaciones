import { forwardRef } from 'react'
import { formatLetterDate, sanitizeCartaHtml } from '../utils/cartaFormatters.js'

function OptionalLine({ children, className = '' }) {
  return children ? <div className={className}>{children}</div> : null
}

const CartaPreview = forwardRef(function CartaPreview({ carta }, ref) {
  const sanitizedBody = sanitizeCartaHtml(carta.cuerpoHtml)

  return (
    <article ref={ref} className={`carta-preview carta-preview--${carta.papel || 'letter'}`}>
      <div className="carta-preview__date">{formatLetterDate(carta.fecha, carta.ciudadFecha)}</div>

      <section className="carta-preview__recipient">
        <OptionalLine>{carta.tratamiento}</OptionalLine>
        <OptionalLine>{carta.destinatario}</OptionalLine>
        <OptionalLine>{carta.cargoDestinatario}</OptionalLine>
        <OptionalLine>{carta.institucion}</OptionalLine>
        <OptionalLine className="carta-preview__present">{carta.presente}</OptionalLine>
      </section>

      <section className="carta-preview__reference">
        <div>REF.: {carta.referencia || 'REFERENCIA DE LA CARTA'}</div>
        {carta.numero && <div>N.º {carta.numero}</div>}
      </section>

      {sanitizedBody ? (
        <section className="carta-preview__body" dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
      ) : (
        <section className="carta-preview__body carta-preview__placeholder">
          Escribe el contenido para visualizar la carta.
        </section>
      )}

      <div className="carta-preview__farewell">{carta.despedida}</div>

      <section className="carta-preview__signature">
        {carta.firmaImagen && <img src={carta.firmaImagen} alt="Firma" className="carta-preview__signature-image" />}
        <OptionalLine className="carta-preview__signer-name">{carta.firmanteNombre}</OptionalLine>
        <OptionalLine>{carta.firmanteCargo}</OptionalLine>
        <OptionalLine>{carta.firmanteDocumento}</OptionalLine>
        <OptionalLine>{carta.firmanteTelefono}</OptionalLine>
        {carta.selloImagen && <img src={carta.selloImagen} alt="Sello" className="carta-preview__stamp-image" />}
      </section>
    </article>
  )
})

export default CartaPreview

