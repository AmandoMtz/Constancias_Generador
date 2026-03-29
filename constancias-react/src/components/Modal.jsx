import './Modal.css'

export default function Modal({ id, title, children, onClose }) {
  return (
    <div className="modal-bg open" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
