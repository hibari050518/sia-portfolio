export default function PageWrapper({ children }) {
  return (
    <div className="page-fade" style={{ paddingTop: '64px', minHeight: '100vh' }}>
      {children}
    </div>
  )
}
