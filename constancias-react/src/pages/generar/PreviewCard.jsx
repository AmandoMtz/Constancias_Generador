/**
 * PreviewCard.jsx  —  src/components/PreviewCard.jsx
 * Tarjeta de previsualización de constancia generada.
 */
export default function PreviewCard({ src, nombre, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
        padding: '18px 18px 14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow .2s, transform .2s',
        width: 180,
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Área de imagen — proporción carta (3:4) */}
      <div style={{
        width: '100%',
        aspectRatio: '3 / 4',
        background: '#f5f5f5',
        borderRadius: 6,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '.5px solid #eee',
      }}>
        {src ? (
          <img
            src={src}
            alt={nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, color: '#ccc',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            <span style={{ fontSize: 10, color: '#bbb' }}>Vista previa</span>
          </div>
        )}
      </div>

      {/* Nombre del archivo */}
      <div
        title={nombre}
        style={{
          fontSize: 12,
          color: '#444',
          textAlign: 'center',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.4,
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 500,
        }}
      >
        {nombre}
      </div>
    </div>
  )
}
