import { Github, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
    const socialLinks = [
        { icon: Github, href: 'https://github.com', label: 'GitHub' },
        { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
        { icon: Mail, href: 'mailto:dev@andregabriel.com', label: 'Email' },
    ];

    return (
        <footer className="bg-white border-t border-border py-12">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Left */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-black text-sm shadow-sm">
                            AG
                        </div>
                        <span className="text-text font-bold text-sm">
                            © {new Date().getFullYear()} André Gabriel
                        </span>
                    </div>

                    {/* Center */}
                    <p className="text-text-muted text-sm font-medium flex items-center gap-1.5 bg-bg-base px-4 py-1.5 rounded-full border border-border">
                        Feito com <Heart size={14} className="text-red-500 fill-current" /> e milhares de questões
                    </p>

                    {/* Right: Socials */}
                    <div className="flex items-center gap-3">
                        {socialLinks.map(({ icon: Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={label}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-base text-text-muted hover:bg-primary hover:text-white transition-all duration-300 border border-border hover:border-primary"
                            >
                                <Icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
