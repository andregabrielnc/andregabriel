import { useState } from 'react';
import { Terminal, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle');

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('sending');
        setTimeout(() => {
            setStatus('sent');
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
    };

    return (
        <section id="contact" className="section container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p className="font-mono text-accent" style={{ marginBottom: '1rem' }}>03. Qual é o próximo passo?</p>
            <h2 style={{ fontSize: '3rem', margin: '0 0 1.5rem' }}>Vamos Conversar.</h2>

            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', textAlign: 'center', marginBottom: '3rem', lineHeight: '1.8' }}>
                No momento estou aberto a novas oportunidades e parcerias. Seja para uma dúvida técnica ou apenas para dizer um oi, tentarei responder o mais rápido possível!
            </p>

            <div className="dev-card" style={{ width: '100%', maxWidth: '600px', padding: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <Terminal size={18} className="text-accent" />
                    <span className="font-mono text-muted text-accent" style={{ fontSize: '0.9rem' }}>~/contato/send_message.sh</span>
                </div>

                {status === 'sent' ? (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', textAlign: 'center' }}>
                        <CheckCircle2 size={64} className="text-accent glow-effect" style={{ marginBottom: '1.5rem' }} />
                        <h3 className="font-mono text-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Mensagem enviada com sucesso!</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Obrigado por entrar em contato. Retornarei em breve.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="name" className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>$ nome</label>
                            <input
                                type="text"
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    padding: '0.8rem 1rem',
                                    color: 'var(--text-main)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="email" className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>$ email</label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    padding: '0.8rem 1rem',
                                    color: 'var(--text-main)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="message" className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>$ mensagem</label>
                            <textarea
                                id="message"
                                rows="5"
                                required
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    padding: '0.8rem 1rem',
                                    color: 'var(--text-main)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s',
                                    resize: 'vertical'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center' }} disabled={status === 'sending'}>
                            {status === 'sending' ? (
                                <><span className="cursor-blink"></span> Enviando...</>
                            ) : (
                                <><Send size={18} /> executar()</>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
};

export default Contact;
