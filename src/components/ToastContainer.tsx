import { Toast } from "@/hooks/useToast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 left-6 z-50 space-y-3 max-w-md">
      {toasts.map((toast) => {
        const Icon = toast.type === "success" ? CheckCircle2 : toast.type === "error" ? XCircle : Info;
        const colorClass = toast.type === "success" ? "brutalist-green" : toast.type === "error" ? "brutalist-pink" : "brutalist-cyan";
        const shadowClass = toast.type === "success" ? "brutalist-shadow" : toast.type === "error" ? "brutalist-shadow-pink" : "brutalist-shadow-cyan";

        return (
          <div
            key={toast.id}
            className={`brutalist-border ${shadowClass} bg-brutalist-charcoal p-4 flex items-center gap-3 animate-in slide-in-from-left duration-300`}
          >
            <div className={`p-2 brutalist-border bg-${colorClass} flex-shrink-0`}>
              <Icon className="w-5 h-5 text-brutalist-charcoal" strokeWidth={3} />
            </div>
            <p className="font-body text-brutalist-cream flex-1">{toast.message}</p>
            <button
              onClick={() => onRemove(toast.id)}
              className="brutalist-border bg-brutalist-charcoal p-1 hover:bg-brutalist-cream/10 transition-colors"
            >
              <X className="w-4 h-4 text-brutalist-cream" strokeWidth={3} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
