import React from 'react'

export function useRenderCount(componentName) {
  const renderCountRef = React.useRef(0)

  React.useEffect(() => {
    renderCountRef.current++
    console.log(`[${componentName}] Render #${renderCountRef.current}`, {
      timestamp: new Date().toISOString(),
    })

    if (renderCountRef.current > 20) {
      console.warn(
        `⚠️ [${componentName}] Posible infinite loop detectado! ${renderCountRef.current} renders`,
      )
    }
  })

  return renderCountRef.current
}

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

export function withCallLog(fn, name) {
  return (...args) => {
    console.log(`[${name}] called with:`, args)
    return fn(...args)
  }
}
