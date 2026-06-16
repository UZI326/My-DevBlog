import { ref } from 'vue'
export interface ToastMessage {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}
const toasts = ref<ToastMessage[]>([])
let nextId = 0

export function useToast() {
  function show(type: ToastMessage['type'], message: string, duration = 3000) {
    const id = nextId++
    toasts.value.push({ id, type, message })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }
  return {
    toasts,
    success: (msg: string) => show('success', msg),
    error: (msg: string) => show('error', msg),
    info: (msg: string) => show('info', msg),
    warning: (msg: string) => show('warning', msg),
  }
}