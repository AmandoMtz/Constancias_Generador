import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ msg: '', tipo: '', show: false })
  const timerRef = useRef(null)

  const showToast = useCallback((msg, tipo = '') => {
    clearTimeout(timerRef.current)
    setToast({ msg, tipo, show: true })
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3500)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className={`toast${toast.show ? ' show' : ''}${toast.tipo ? ` ${toast.tipo}` : ''}`}>
        {toast.msg}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
