import { Github, Linkedin } from 'lucide-react';

const Hero = () => {
    return (
        <section id="home" className="hero-section">
            <div className="container">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>Hello, I'm André Gabriel</h1>
                        <h2>Full-Stack Developer</h2>
                        <p>
                            I am a Full-Stack Developer with extensive experience in creating & designing websites, mobile apps, and desktop applications. My expertise is in building robust and scalable digital solutions.
                        </p>
                        <a href="#contact" className="btn-primary">SAY HELLO</a>
                        <div className="social-links">
                            <a href="#" aria-label="GitHub">
                                <Github size={24} />
                            </a>
                            <a href="#" aria-label="LinkedIn">
                                <Linkedin size={24} />
                            </a>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img src="/avatar-placeholder.svg" alt="André Gabriel" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
