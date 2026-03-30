import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react';

const contactInfo = [
  { icon: Mail, label: 'Email para Mentoria', value: 'concursos@andregabriel.com', href: 'mailto:concursos@andregabriel.com' },
  { icon: Phone, label: 'WhatsApp Principal', value: '+55 (62) 00000-0000', href: 'tel:+5562000000000' },
  { icon: MapPin, label: 'Localização', value: 'Goiânia - GO, Brasil', href: '#' },
];

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      setFormData({ name: '', email: '', whatsapp: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    }, 1500);
  };

  const inputClasses = "w-full bg-bg border border-border rounded-lg px-4 py-3 text-text text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-text-dim";

  return (
    <section id="contact" className="py-16 sm:py-24 bg-bg border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Contato</p>
          <h2 className="text-2xl sm:text-3xl font-black text-text font-heading mb-3">Dê o Primeiro Passo</h2>
          <p className="text-text-muted max-w-md mx-auto text-sm">
            A preparação estratégica começa aqui. Entre em contato para entender como a mentoria pode transformar seu desempenho.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2 space-y-3"
          >
            {contactInfo.map((info, i) => {
              const Icon = info.icon;
              return (
                <a
                  key={i}
                  href={info.href}
                  className="flex items-center gap-3 p-4 bg-white border border-border rounded-xl hover:border-primary/40 hover:shadow-sm transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-200 shrink-0">
                    <Icon size={17} />
                  </div>
                  <div>
                    <p className="text-text-dim text-xs font-bold uppercase tracking-wider">{info.label}</p>
                    <p className="text-text text-sm font-semibold">{info.value}</p>
                  </div>
                </a>
              );
            })}

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-primary text-xs font-bold mb-1">Vagas limitadas por ciclo</p>
              <p className="text-text-muted text-xs leading-relaxed">
                Reservo poucas vagas para garantir o nível de proximidade necessário na mentoria. Respondo em até 24h.
              </p>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white border border-border rounded-2xl p-6 sm:p-8">
              {status === 'sent' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <CheckCircle size={52} className="text-emerald-500 mb-3" />
                  <h3 className="text-lg font-bold text-text font-heading mb-1">Contato Recebido!</h3>
                  <p className="text-text-muted text-sm">Entrarei em contato em breve para falarmos sobre a Mentoria.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClasses}
                    />
                    <input
                      type="email"
                      placeholder="Seu melhor email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="WhatsApp com DDD"
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className={inputClasses}
                  />
                  <textarea
                    rows={4}
                    placeholder="Para qual concurso ou banca você está se preparando e qual a sua maior dificuldade?"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`${inputClasses} resize-none`}
                  />
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full py-3.5 bg-accent text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-accent-dark transition-colors text-sm disabled:opacity-60"
                  >
                    {status === 'sending' ? (
                      <span className="animate-pulse">Enviando...</span>
                    ) : (
                      <>
                        <Send size={16} />
                        Solicitar Contato para Mentoria
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
