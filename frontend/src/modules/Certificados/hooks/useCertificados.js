import { useCallback, useState } from 'react'
import { certificadosRepository } from '../data/certificadosRepository.js'

export function useCertificados() {
  const [certificados, setCertificados] = useState(certificadosRepository.list)
  const saveCertificado = useCallback((values, id) => {
    const saved = certificadosRepository.save(values, id)
    setCertificados(certificadosRepository.list())
    return saved
  }, [])
  const deleteCertificado = useCallback((id) => {
    certificadosRepository.remove(id)
    setCertificados(certificadosRepository.list())
  }, [])
  return { certificados, saveCertificado, deleteCertificado }
}

