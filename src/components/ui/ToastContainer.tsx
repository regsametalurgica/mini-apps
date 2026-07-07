import { useToastStore } from '../../stores/useToastStore';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto
            flex items-start gap-4 p-4 rounded-2xl border shadow-2xl backdrop-blur-md
            animate-in slide-in-from-right-full duration-300
            ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : ''}
            ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : ''}
            ${toast.type === 'info' ? 'bg-primary/10 border-primary/20 text-primary' : ''}
          `}
        >
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${toast.type === 'success' ? 'bg-green-500/20' : ''}
            ${toast.type === 'error' ? 'bg-red-500/20' : ''}
            ${toast.type === 'info' ? 'bg-primary/20' : ''}
          `}>
            {toast.type === 'success' && <i className="bi bi-check-circle-fill text-lg"></i>}
            {toast.type === 'error' && <i className="bi bi-exclamation-triangle-fill text-lg"></i>}
            {toast.type === 'info' && <i className="bi bi-info-circle-fill text-lg"></i>}
          </div>

          <div className="flex-1 pt-1">
            <h4 className="font-bold text-sm leading-none mb-1 text-content-main">{toast.message}</h4>
            {toast.description && (
              <p className="text-[12px] opacity-70 leading-relaxed font-medium">
                {toast.description}
              </p>
            )}
          </div>

          <button 
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors opacity-50 hover:opacity-100"
          >
            <i className="bi bi-x text-xl"></i>
          </button>
        </div>
      ))}
    </div>
  );
};
