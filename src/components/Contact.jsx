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
    const isInView = useInView(ref, { once: true, margin: '-100px' });
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

    const inputClasses = "w-full bg-white border border-border rounded-xl px-4 py-3 text-text text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300 placeholder:text-text-dim shadow-sm";

    return (
        <section id="contact" className="py-24 relative bg-bg-base border-t border-border">
            <div className="max-w-6xl mx-auto px-6" ref={ref}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="font-semibold text-primary tracking-wider uppercase text-sm">Contato</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-text mt-2">Dê o Primeiro Passo</h2>
                    <p className="text-text-muted mt-4 max-w-xl mx-auto">
                        A preparação estratégica para a sua aprovação começa aqui. Entre em contato para entender como a mentoria pode transformar o seu desempenho.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-5 gap-10">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-2 space-y-5"
                    >
                        {contactInfo.map((info, i) => {
                            const Icon = info.icon;
                            return (
                                <a
                                    key={i}
                                    href={info.href}
                                    className="flex items-center gap-4 p-5 bg-white border border-border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <span className="text-text-dim text-xs font-bold uppercase tracking-wider">{info.label}</span>
                                        <p className="text-text text-sm font-semibold">{info.value}</p>
                                    </div>
                                </a>
                            );
                        })}

                        {/* Mini decorative card */}
                        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                                💡 Reservo poucas vagas por ciclo para garantir o **nível de proximidade** necessário na mentoria. Respondo em até 24h.
                            </p>
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
                            {status === 'sent' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-16 text-center"
                                >
                                    <CheckCircle size={64} className="text-primary mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">Contato Recebido!</h3>
                                    <p className="text-text-muted text-sm font-medium">Obrigado pela mensagem. Entrarei em contato em breve para falarmos sobre a Mentoria.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-5">
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
                                        rows={5}
                                        placeholder="Para qual concurso ou banca você está se preparando e qual a sua maior dificuldade?"
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className={`${inputClasses} resize-none`}
                                    />

                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary-dark hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {status === 'sending' ? (
                                            <span className="animate-pulse">Enviando Solicitação...</span>
                                        ) : (
                                            <>
                                                <Send size={18} /> Solicitar Contato para Mentoria
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
