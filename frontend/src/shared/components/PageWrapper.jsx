import { useIsMobile } from '../../hooks/useIsMobile'

function PageWrapper({ children, style }) {
  const isMobile = useIsMobile()

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        padding: isMobile ? 12 : 24,
        margin: isMobile ? -12 : -24,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export default PageWrapper
