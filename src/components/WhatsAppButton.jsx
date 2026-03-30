import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5562981205208"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contato via WhatsApp"
      className="fixed bottom-5 right-5 z-50 w-13 h-13 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
      style={{ width: 52, height: 52 }}
    >
      <MessageCircle size={24} />
    </a>
  );
};

export default WhatsAppButton;
