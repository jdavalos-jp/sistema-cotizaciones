/**
 * Calcula los días hábiles entre dos fechas (de lunes a viernes)
 * @param {Date|string} fechaInicio - Fecha de inicio
 * @param {Date|string} fechaFin - Fecha final
 * @param {Array<Date>} diasFestivos - Array opcional de días festivos a excluir
 * @returns {number} Cantidad de días hábiles
 */
function calcularDiasHabiles(fechaInicio, fechaFin, diasFestivos = []) {
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)
    
    let diasHabiles = 0
    const fecha = new Date(inicio)
    
    while (fecha <= fin) {
        const diaSemana = fecha.getDay() // 0 = domingo, 6 = sábado
        const esFestivo = diasFestivos.some(
            (f) => new Date(f).toDateString() === fecha.toDateString()
        )
        
        // Es día hábil si no es sábado (6) ni domingo (0) ni festivo
        if (diaSemana !== 0 && diaSemana !== 6 && !esFestivo) {
            diasHabiles++
        }
        
        fecha.setDate(fecha.getDate() + 1)
    }
    
    return diasHabiles
}

/**
 * Obtiene detalles de los días hábiles entre dos fechas
 * @param {Date|string} fechaInicio
 * @param {Date|string} fechaFin
 * @param {Array<Date>} diasFestivos
 * @returns {Object} Objeto con información detallada
 */
function obtenerDetallesDiasHabiles(fechaInicio, fechaFin, diasFestivos = []) {
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)
    
    let diasHabiles = 0
    let diasTotales = 0
    let diasFinesSemana = 0
    const fecha = new Date(inicio)
    
    while (fecha <= fin) {
        diasTotales++
        const diaSemana = fecha.getDay()
        
        if (diaSemana === 0 || diaSemana === 6) {
            diasFinesSemana++
        } else if (!diasFestivos.some(f => new Date(f).toDateString() === fecha.toDateString())) {
            diasHabiles++
        }
        
        fecha.setDate(fecha.getDate() + 1)
    }
    
    return {
        diasHabiles,
        diasTotales,
        diasFinesSemana,
        diasFestivos: diasFestivos.length,
        porcentajeHabiles: ((diasHabiles / diasTotales) * 100).toFixed(2),
    }
}

module.exports = {
    calcularDiasHabiles,
    obtenerDetallesDiasHabiles,
}
