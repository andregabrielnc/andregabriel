import { useState } from 'react';
import { Cookie, X } from 'lucide-react';

const CookieBanner = () => {
  const [visible, setVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  if (!visible) return null;

  return (
    <>
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5">
        <div className="max-w-2xl mx-auto bg-white border border-border rounded-2xl shadow-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie size={20} className="text-primary shrink-0 mt-0.5" />
            <p className="text-text text-sm leading-relaxed">
              Nós usaremos cookies para melhorar e personalizar sua experiência.
            </p>
          </div>
          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setVisible(false)}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Aceitar Cookies
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-bg border border-border text-text-muted text-sm font-semibold rounded-lg hover:border-border-dark hover:text-text transition-colors"
            >
              Saiba mais
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Cookie size={20} className="text-primary" />
              <h3 className="font-bold text-text font-heading text-base">Política de Cookies</h3>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              Nossa plataforma recolhe informações durante a sua visita ao site através do uso de cookies. Usamos esses cookies por diversos motivos, geralmente para distinguir você de outros usuários de nossos sites e personalizar sua visita.
            </p>
            <button
              onClick={() => setModalOpen(false)}
              className="mt-6 w-full py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieBanner;
