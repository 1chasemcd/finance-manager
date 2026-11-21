export type ToastSeverity = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: number;
  message: string;
  severity: ToastSeverity;
}

type Listener = (toast: ToastMessage) => void;

let listener: Listener | null = null;
let nextId = 0;

export const toast = {
  show(message: string, severity: ToastSeverity = "info") {
    listener?.({
      id: ++nextId,
      message,
      severity,
    });
  },

  success(message: string) {
    this.show(message, "success");
  },

  error(message: string) {
    this.show(message, "error");
  },

  warning(message: string) {
    this.show(message, "warning");
  },

  info(message: string) {
    this.show(message, "info");
  },

  subscribe(callback: Listener) {
    listener = callback;

    return () => {
      if (listener === callback) {
        listener = null;
      }
    };
  },
};
