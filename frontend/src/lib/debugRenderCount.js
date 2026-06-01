import React from 'react'

/**
 * Hook para detectar renders infinitos en componentes
 * Ayuda a diagnosticar infinite loops causados por malas dependencias en useEffect
 */
export function useRenderCount(componentName) {
  const renderCountRef = React.useRef(0)

  React.useEffect(() => {
    renderCountRef.current++
    console.log(`[${componentName}] Render #${renderCountRef.current}`, {
      timestamp: new Date().toISOString(),
    })

    // Alertar si se renderiza más de 20 veces en 5 segundos
    if (renderCountRef.current > 20) {
      console.warn(
        `⚠️ [${componentName}] Posible infinite loop detectado! ${renderCountRef.current} renders`,
      )
    }
  })

  return renderCountRef.current
}

/**
 * Hook para detectar cuándo cambian las dependencias de useEffect
 * USE: useLogDependencyChanges(dependencies, 'nombreDelHook')
 */
export function useLogDependencyChanges(deps, hookName) {
  const prevDepsRef = React.useRef()

  React.useEffect(() => {
    if (prevDepsRef.current) {
      const changes = deps
        .map((dep, i) => {
          const prev = prevDepsRef.current[i]
          const changed = prev !== dep
          return {
            index: i,
            changed,
            prevType: typeof prev,
            currentType: typeof dep,
          }
        })
        .filter((x) => x.changed)

      if (changes.length > 0) {
        console.log(`[${hookName}] Dependencias cambiaron:`, changes)
      }
    }

    prevDepsRef.current = deps
  }, deps)
}

/**
 * Envuelve una función para loguear cada llamada
 * USE: const myFunc = withCallLog((x) => x + 1, 'myFunc')
 */
export function withCallLog(fn, name) {
  return (...args) => {
    console.log(`[${name}] called with:`, args)
    return fn(...args)
  }
}
