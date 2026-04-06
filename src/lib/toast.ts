// Toast notification system
let toastId = 0;

export type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
};

const toasts: Toast[] = [];
const listeners = new Set<(toasts: Toast[]) => void>();

export const toast = {
  success: (message: string, duration = 4000) => {
    return addToast(message, 'success', duration);
  },

  error: (message: string, duration = 5000) => {
    return addToast(message, 'error', duration);
  },

  info: (message: string, duration = 4000) => {
    return addToast(message, 'info', duration);
  },

  warning: (message: string, duration = 4000) => {
    return addToast(message, 'warning', duration);
  },

  dismiss: (id: number) => {
    const index = toasts.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      notifyListeners();
    }
  },

  subscribe: (listener: (toasts: Toast[]) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getAll: () => [...toasts],
};

function addToast(message: string, type: Toast['type'], duration?: number): number {
  const id = toastId++;
  const newToast: Toast = { id, message, type, duration };

  toasts.push(newToast);
  notifyListeners();

  if (duration) {
    setTimeout(() => toast.dismiss(id), duration);
  }

  return id;
}

function notifyListeners() {
  listeners.forEach((listener) => listener([...toasts]));
}
