import { useState } from 'react'
import { useImagenesProducto } from '../hooks/useImagenes'

export function ImagenUploadTest({ idProducto = 1 }) {
  const [file, setFile] = useState(null)
  const { imagenes, loading, error, subirImagen, eliminarImagen, hacerPrincipal } =
    useImagenesProducto(idProducto)

  const handleUpload = async () => {
    if (!file) return alert('Selecciona una imagen')
    const resultado = await subirImagen(file)
    if (resultado) {
      setFile(null)
      alert(' Imagen subida correctamente')
    }
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>🧪 Test de Imágenes - Producto ID: {idProducto}</h3>

      {/* INPUT */}
      <div style={{ marginBottom: '15px' }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={loading}
          style={{ padding: '8px' }}
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          style={{
            padding: '8px 16px',
            marginLeft: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '⏳ Subiendo...' : '📤 Subir'}
        </button>
      </div>

      {/* ERROR */}
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>⚠️ {error}</div>}

      {/* LISTA DE IMÁGENES */}
      <div style={{ marginTop: '20px' }}>
        <h4>Imágenes ({imagenes.length})</h4>
        {imagenes.length === 0 ? (
          <p style={{ color: '#666' }}>No hay imágenes aún</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '10px',
            }}
          >
            {imagenes.map((img) => (
              <div
                key={img.idImagen}
                style={{
                  border: img.principal ? '3px solid gold' : '1px solid #ddd',
                  padding: '8px',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
              >
                <img
                  src={img.urlThumb}
                  alt="preview"
                  style={{
                    width: '100%',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '8px',
                  }}
                />
                <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                  {img.principal && <span style={{ color: 'gold' }}>⭐ Principal</span>}
                </div>
                <button
                  onClick={() => hacerPrincipal(img.idImagen)}
                  disabled={loading || img.principal}
                  style={{
                    padding: '4px 8px',
                    marginRight: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Destacar
                </button>
                <button
                  onClick={() => eliminarImagen(img.idImagen)}
                  disabled={loading}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: 'red',
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INFO */}
      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          fontSize: '12px',
        }}
      >
        <p>
          <strong>API:</strong> POST /productos/{idProducto}/imagenes
        </p>
        <p>
          <strong>BD:</strong> ProductoImagen (18 columnas)
        </p>
        <p>
          <strong>Storage:</strong> Supabase Storage / productos/{idProducto}/
        </p>
      </div>
    </div>
  )
}
