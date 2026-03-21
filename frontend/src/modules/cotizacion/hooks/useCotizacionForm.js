import { useState, useCallback } from 'react'

/**
 * Hook para gestionar el estado completo del formulario de cotización
 */
export function useCotizacionForm() {
  const [idCliente, setIdCliente] = useState(null)
  const [clienteLabel, setClienteLabel] = useState('')
  const [fechaInicio, setFechaInicio] = useState(null)
  const [fechaValidez, setFechaValidez] = useState(null)
  const [moneda, setMoneda] = useState('Bs')

  const resetForm = useCallback(() => {
    setIdCliente(null)
    setClienteLabel('')
    setFechaInicio(null)
    setFechaValidez(null)
    setMoneda('Bs')
  }, [])

  return {
    idCliente,
    setIdCliente,
    clienteLabel,
    setClienteLabel,
    fechaInicio,
    setFechaInicio,
    fechaValidez,
    setFechaValidez,
    moneda,
    setMoneda,
    resetForm,
  }
}
